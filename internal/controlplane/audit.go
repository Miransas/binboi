package controlplane

import (
	"encoding/json"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type auditEventOptions struct {
	Level           string
	Message         string
	Action          string
	ResourceType    string
	ResourceID      string
	TunnelSubdomain string
	OwnerUserID     string
	OwnerEmail      string
	AccessScope     string
	Details         map[string]any
}

func requestAccessScope(access requestAccess) string {
	if access.Identity != nil {
		return "token"
	}
	if access.TrustedLocal {
		return "trusted-local"
	}
	return "anonymous"
}

func marshalEventDetails(details map[string]any) string {
	if len(details) == 0 {
		return ""
	}
	payload, err := json.Marshal(details)
	if err != nil {
		return ""
	}
	return string(payload)
}

func unmarshalEventDetails(raw string) map[string]any {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil
	}

	var details map[string]any
	if err := json.Unmarshal([]byte(raw), &details); err != nil {
		return nil
	}
	return details
}

func normalizeEventRecord(record EventRecord) EventRecord {
	record.Level = normalizeEventLevelFilter(record.Level)
	if record.Level == "" {
		record.Level = "info"
	}
	record.Message = strings.TrimSpace(record.Message)
	record.Action = normalizeEventActionFilter(record.Action)
	record.ResourceType = strings.ToLower(strings.TrimSpace(record.ResourceType))
	record.ResourceID = strings.TrimSpace(record.ResourceID)
	record.TunnelSubdomain = strings.ToLower(strings.TrimSpace(record.TunnelSubdomain))
	record.OwnerUserID = strings.TrimSpace(record.OwnerUserID)
	record.OwnerEmail = strings.TrimSpace(record.OwnerEmail)
	record.ActorUserID = strings.TrimSpace(record.ActorUserID)
	record.ActorEmail = strings.TrimSpace(record.ActorEmail)
	record.AccessScope = strings.ToLower(strings.TrimSpace(record.AccessScope))
	record.RequestID = strings.TrimSpace(record.RequestID)
	record.DetailsJSON = strings.TrimSpace(record.DetailsJSON)
	if record.CreatedAt.IsZero() {
		record.CreatedAt = time.Now().UTC()
	}
	return record
}

func (s *Service) persistEvent(record EventRecord) {
	record = normalizeEventRecord(record)

	attrs := []any{
		"component", "controlplane",
		"event_level", record.Level,
	}
	if record.TunnelSubdomain != "" {
		attrs = append(attrs, "tunnel_subdomain", record.TunnelSubdomain)
	}
	if record.Action != "" {
		attrs = append(attrs, "action", record.Action)
	}
	if record.ResourceType != "" {
		attrs = append(attrs, "resource_type", record.ResourceType)
	}
	if record.ResourceID != "" {
		attrs = append(attrs, "resource_id", record.ResourceID)
	}
	if record.ActorEmail != "" {
		attrs = append(attrs, "actor_email", record.ActorEmail)
	}
	if record.AccessScope != "" {
		attrs = append(attrs, "access_scope", record.AccessScope)
	}
	if record.RequestID != "" {
		attrs = append(attrs, "request_id", record.RequestID)
	}
	if record.DetailsJSON != "" {
		attrs = append(attrs, "details", compactPreview(record.DetailsJSON, 240))
	}

	s.logRuntimeEvent(slogLevelFromString(record.Level), record.Message, attrs...)

	if err := s.db.Create(&record).Error; err == nil {
		_ = s.pruneEventRecords(s.storedEventLimit())
	}
}

func (s *Service) writeEvent(record EventRecord, live bool) {
	record = normalizeEventRecord(record)

	if live {
		line := record.CreatedAt.Format(time.RFC3339) + " [" + strings.ToUpper(record.Level) + "] " + record.Message

		s.logMu.Lock()
		s.backlog = append([]string{line}, s.backlog...)
		if len(s.backlog) > maxLogBacklog {
			s.backlog = s.backlog[:maxLogBacklog]
		}

		for client := range s.clients {
			if err := client.WriteMessage(websocket.TextMessage, []byte(line)); err != nil {
				client.Close()
				delete(s.clients, client)
			}
		}
		s.logMu.Unlock()
	}

	s.persistEvent(record)
}

func (s *Service) emitAuditEvent(c *gin.Context, options auditEventOptions, live bool) {
	access := currentRequestAccess(c)

	record := EventRecord{
		Level:           options.Level,
		Message:         options.Message,
		TunnelSubdomain: options.TunnelSubdomain,
		Action:          options.Action,
		ResourceType:    options.ResourceType,
		ResourceID:      options.ResourceID,
		OwnerUserID:     options.OwnerUserID,
		OwnerEmail:      options.OwnerEmail,
		AccessScope:     options.AccessScope,
		RequestID:       requestIDFromContext(c),
		DetailsJSON:     marshalEventDetails(options.Details),
	}

	if access.Identity != nil {
		record.ActorUserID = access.Identity.UserID
		record.ActorEmail = access.Identity.Email
		if record.OwnerUserID == "" {
			record.OwnerUserID = access.Identity.UserID
		}
		if record.OwnerEmail == "" {
			record.OwnerEmail = access.Identity.Email
		}
	}
	if record.AccessScope == "" {
		record.AccessScope = requestAccessScope(access)
	}

	s.writeEvent(record, live)
}

func (s *Service) mapEventRecord(record EventRecord) EventResponse {
	return EventResponse{
		Level:           record.Level,
		Message:         record.Message,
		TunnelSubdomain: record.TunnelSubdomain,
		Action:          record.Action,
		ResourceType:    record.ResourceType,
		ResourceID:      record.ResourceID,
		ActorEmail:      record.ActorEmail,
		OwnerEmail:      record.OwnerEmail,
		AccessScope:     record.AccessScope,
		RequestID:       record.RequestID,
		Details:         unmarshalEventDetails(record.DetailsJSON),
		CreatedAt:       record.CreatedAt,
	}
}
