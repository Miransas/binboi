package controlplane

import (
	"context"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type QuotaUsage struct {
	Used      int64  `json:"used"`
	Limit     int    `json:"limit"`
	Unlimited bool   `json:"unlimited"`
	Remaining *int64 `json:"remaining,omitempty"`
}

type QuotaSnapshot struct {
	Plan                    string     `json:"plan"`
	AccessScope             string     `json:"access_scope"`
	ReservedTunnels         QuotaUsage `json:"reserved_tunnels"`
	ActiveTunnels           QuotaUsage `json:"active_tunnels"`
	CustomDomains           QuotaUsage `json:"custom_domains"`
	RequestsPerDay          QuotaUsage `json:"requests_per_day"`
	RequestHistoryLimit     int        `json:"request_history_limit"`
	RequestRetentionSeconds int64      `json:"request_retention_seconds"`
	EventRetentionSeconds   int64      `json:"event_retention_seconds"`
}

func quotaUsage(limit int, used int64) QuotaUsage {
	usage := QuotaUsage{
		Used:      used,
		Limit:     limit,
		Unlimited: limit <= 0,
	}

	if limit > 0 {
		remaining := int64(limit) - used
		if remaining < 0 {
			remaining = 0
		}
		usage.Remaining = &remaining
	}

	return usage
}

func (s *Service) quotaSnapshot(ctx context.Context, access requestAccess) (QuotaSnapshot, error) {
	if ctx == nil {
		ctx = context.Background()
	}

	quota := quotaForAccess(access)
	reserved, err := s.countReservedTunnelsForAccess(ctx, access)
	if err != nil {
		return QuotaSnapshot{}, err
	}
	active, err := s.countActiveTunnelsForAccess(ctx, access)
	if err != nil {
		return QuotaSnapshot{}, err
	}
	domains, err := s.countCustomDomainsForAccess(ctx, access)
	if err != nil {
		return QuotaSnapshot{}, err
	}
	requestsToday, err := s.countRequestsTodayForAccess(ctx, access)
	if err != nil {
		return QuotaSnapshot{}, err
	}

	return QuotaSnapshot{
		Plan:                    quota.Plan,
		AccessScope:             requestAccessScope(access),
		ReservedTunnels:         quotaUsage(quota.MaxReservedTunnels, reserved),
		ActiveTunnels:           quotaUsage(quota.MaxActiveTunnels, active),
		CustomDomains:           quotaUsage(quota.MaxCustomDomains, domains),
		RequestsPerDay:          quotaUsage(quota.MaxRequestsPerDay, requestsToday),
		RequestHistoryLimit:     quota.MaxRequestHistory,
		RequestRetentionSeconds: int64(quota.RequestRetention.Seconds()),
		EventRetentionSeconds:   int64(quota.EventRetention.Seconds()),
	}, nil
}

func (s *Service) scopedTunnelQuery(ctx context.Context, access requestAccess) *gorm.DB {
	query := s.db.WithContext(ctx).Model(&TunnelRecord{})
	if access.Identity != nil && s.authProvider != nil && s.authProvider.Enabled() && access.Identity.AuthMode != "instance-token-preview" {
		return query.Where("owner_user_id = ?", access.Identity.UserID)
	}
	return query
}

func (s *Service) countReservedTunnelsForAccess(ctx context.Context, access requestAccess) (int64, error) {
	var count int64
	if err := s.scopedTunnelQuery(ctx, access).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (s *Service) countActiveTunnelsForAccess(ctx context.Context, access requestAccess) (int64, error) {
	var count int64
	if err := s.scopedTunnelQuery(ctx, access).Where("status = ?", "ACTIVE").Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (s *Service) countCustomDomainsForAccess(ctx context.Context, access requestAccess) (int64, error) {
	query := s.db.WithContext(ctx).Model(&DomainRecord{}).Where("type = ?", "CUSTOM")
	if access.Identity != nil && s.authProvider != nil && s.authProvider.Enabled() && access.Identity.AuthMode != "instance-token-preview" {
		query = query.Where("owner_user_id = ?", access.Identity.UserID)
	}

	var count int64
	if err := query.Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func (s *Service) countRequestsTodayForAccess(ctx context.Context, access requestAccess) (int64, error) {
	startOfDay := time.Now().UTC().Truncate(24 * time.Hour)
	query := s.db.WithContext(ctx).
		Model(&RequestRecord{}).
		Where("request_records.created_at >= ?", startOfDay)

	if access.Identity != nil && s.authProvider != nil && s.authProvider.Enabled() && access.Identity.AuthMode != "instance-token-preview" {
		query = query.Joins("JOIN tunnel_records ON tunnel_records.id = request_records.tunnel_id").
			Where("tunnel_records.owner_user_id = ?", access.Identity.UserID)
	}

	var count int64
	if err := query.Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

func applyQuotaHeaders(c *gin.Context, snapshot QuotaSnapshot) {
	c.Header("X-Binboi-Plan", snapshot.Plan)
	c.Header("X-Binboi-Quota-Scope", snapshot.AccessScope)
	c.Header("X-Binboi-Quota-Reserved-Tunnels-Limit", strconv.Itoa(snapshot.ReservedTunnels.Limit))
	c.Header("X-Binboi-Quota-Reserved-Tunnels-Used", strconv.FormatInt(snapshot.ReservedTunnels.Used, 10))
	if snapshot.ReservedTunnels.Remaining != nil {
		c.Header("X-Binboi-Quota-Reserved-Tunnels-Remaining", strconv.FormatInt(*snapshot.ReservedTunnels.Remaining, 10))
	}
	c.Header("X-Binboi-Quota-Active-Tunnels-Limit", strconv.Itoa(snapshot.ActiveTunnels.Limit))
	c.Header("X-Binboi-Quota-Active-Tunnels-Used", strconv.FormatInt(snapshot.ActiveTunnels.Used, 10))
	if snapshot.ActiveTunnels.Remaining != nil {
		c.Header("X-Binboi-Quota-Active-Tunnels-Remaining", strconv.FormatInt(*snapshot.ActiveTunnels.Remaining, 10))
	}
	c.Header("X-Binboi-Quota-Custom-Domains-Limit", strconv.Itoa(snapshot.CustomDomains.Limit))
	c.Header("X-Binboi-Quota-Custom-Domains-Used", strconv.FormatInt(snapshot.CustomDomains.Used, 10))
	if snapshot.CustomDomains.Remaining != nil {
		c.Header("X-Binboi-Quota-Custom-Domains-Remaining", strconv.FormatInt(*snapshot.CustomDomains.Remaining, 10))
	}
	c.Header("X-Binboi-Quota-Requests-Per-Day-Limit", strconv.Itoa(snapshot.RequestsPerDay.Limit))
	c.Header("X-Binboi-Quota-Requests-Per-Day-Used", strconv.FormatInt(snapshot.RequestsPerDay.Used, 10))
	if snapshot.RequestsPerDay.Remaining != nil {
		c.Header("X-Binboi-Quota-Requests-Per-Day-Remaining", strconv.FormatInt(*snapshot.RequestsPerDay.Remaining, 10))
	}
	c.Header("X-Binboi-Quota-Request-History-Limit", strconv.Itoa(snapshot.RequestHistoryLimit))
}

func (s *Service) hydrateQuotaHeaders(c *gin.Context, access requestAccess) {
	if c == nil {
		return
	}
	snapshot, err := s.quotaSnapshot(c.Request.Context(), access)
	if err != nil {
		return
	}
	applyQuotaHeaders(c, snapshot)
}

func (s *Service) quotaHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		s.hydrateQuotaHeaders(c, currentRequestAccess(c))
		c.Next()
	}
}
