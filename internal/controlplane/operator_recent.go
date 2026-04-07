package controlplane

import (
	"context"
	"time"

	"gorm.io/gorm"
)

const (
	defaultOperatorRecentCriticalEventLimit = 5
	defaultOperatorRecentTunnelLimit        = 8
)

type OperatorTunnelStatusCounts struct {
	Active   int64 `json:"active"`
	Inactive int64 `json:"inactive"`
	Error    int64 `json:"error"`
}

type OperatorTunnelState struct {
	ID                 string     `json:"id"`
	Subdomain          string     `json:"subdomain"`
	Status             string     `json:"status"`
	Region             string     `json:"region"`
	Target             string     `json:"target"`
	PublicURL          string     `json:"public_url"`
	RequestCount       int64      `json:"request_count"`
	BytesOut           int64      `json:"bytes_out"`
	LastError          string     `json:"last_error,omitempty"`
	LastConnectedAt    *time.Time `json:"last_connected_at,omitempty"`
	LastDisconnectedAt *time.Time `json:"last_disconnected_at,omitempty"`
	UpdatedAt          time.Time  `json:"updated_at"`
	ActiveSession      bool       `json:"active_session"`
}

type OperatorTunnelSummary struct {
	StatusCounts OperatorTunnelStatusCounts `json:"status_counts"`
	Recent       []OperatorTunnelState      `json:"recent"`
}

func (s *Service) scopedEventQuery(access requestAccess) *gorm.DB {
	query := s.db.Model(&EventRecord{})
	if access.Identity != nil && s.authProvider != nil && s.authProvider.Enabled() {
		ownedSubdomains := s.db.Model(&TunnelRecord{}).
			Select("subdomain").
			Where("owner_user_id = ?", access.Identity.UserID)
		query = query.Where(
			"event_records.owner_user_id = ? OR (COALESCE(event_records.owner_user_id, '') = '' AND event_records.tunnel_subdomain IN (?))",
			access.Identity.UserID,
			ownedSubdomains,
		)
	}
	return s.applyAccessRetentionWindow(query, access, "event_records.created_at", false)
}

func (s *Service) recentCriticalEvents(access requestAccess, limit int) ([]EventResponse, error) {
	if limit <= 0 {
		limit = defaultOperatorRecentCriticalEventLimit
	}

	var records []EventRecord
	if err := s.scopedEventQuery(access).
		Where("LOWER(event_records.level) IN ?", []string{"warn", "error"}).
		Order("event_records.created_at desc").
		Limit(limit).
		Find(&records).
		Error; err != nil {
		return nil, err
	}

	response := make([]EventResponse, 0, len(records))
	for _, record := range records {
		response = append(response, s.mapEventRecord(record))
	}
	return response, nil
}

func (s *Service) operatorTunnelSummary(access requestAccess, limit int) (OperatorTunnelSummary, error) {
	if limit <= 0 {
		limit = defaultOperatorRecentTunnelLimit
	}

	query := s.scopedTunnelQuery(context.Background(), access)

	type groupedStatusCount struct {
		Status string
		Count  int64
	}

	var grouped []groupedStatusCount
	if err := query.
		Select("LOWER(status) AS status, COUNT(*) AS count").
		Group("LOWER(status)").
		Scan(&grouped).
		Error; err != nil {
		return OperatorTunnelSummary{}, err
	}

	statusCounts := OperatorTunnelStatusCounts{}
	for _, row := range grouped {
		switch row.Status {
		case "active":
			statusCounts.Active += row.Count
		case "error":
			statusCounts.Error += row.Count
		default:
			statusCounts.Inactive += row.Count
		}
	}

	var records []TunnelRecord
	if err := s.scopedTunnelQuery(context.Background(), access).
		Order("updated_at desc").
		Limit(limit).
		Find(&records).
		Error; err != nil {
		return OperatorTunnelSummary{}, err
	}

	recent := make([]OperatorTunnelState, 0, len(records))
	for _, record := range records {
		recent = append(recent, s.mapOperatorTunnelState(record))
	}

	return OperatorTunnelSummary{
		StatusCounts: statusCounts,
		Recent:       recent,
	}, nil
}

func (s *Service) mapOperatorTunnelState(record TunnelRecord) OperatorTunnelState {
	return OperatorTunnelState{
		ID:                 record.ID,
		Subdomain:          record.Subdomain,
		Status:             record.Status,
		Region:             record.Region,
		Target:             record.Target,
		PublicURL:          s.BuildPublicURL(record.Subdomain),
		RequestCount:       record.RequestCount,
		BytesOut:           record.BytesTransferred,
		LastError:          record.LastError,
		LastConnectedAt:    record.LastConnectedAt,
		LastDisconnectedAt: record.LastDisconnectedAt,
		UpdatedAt:          record.UpdatedAt,
		ActiveSession:      s.hasActiveSession(record.Subdomain),
	}
}

func (s *Service) hasActiveSession(subdomain string) bool {
	s.mu.RLock()
	defer s.mu.RUnlock()
	_, ok := s.sessions[subdomain]
	return ok
}
