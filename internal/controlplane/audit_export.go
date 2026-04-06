package controlplane

import (
	"encoding/csv"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func normalizeAuditExportFormat(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "csv":
		return "csv"
	case "json":
		return "json"
	default:
		return "ndjson"
	}
}

func (s *Service) findEventRecords(access requestAccess, options eventListOptions) ([]EventRecord, error) {
	var records []EventRecord
	options.Level = normalizeEventLevelFilter(options.Level)
	options.Action = normalizeEventActionFilter(options.Action)
	options.Tunnel = strings.ToLower(strings.TrimSpace(options.Tunnel))
	options.Query = normalizeSearchQuery(options.Query)

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
	query = s.applyAccessRetentionWindow(query, access, "event_records.created_at", false)
	if options.Level != "" {
		query = query.Where("LOWER(event_records.level) = ?", options.Level)
	}
	if options.Action != "" {
		query = query.Where("LOWER(event_records.action) = ?", options.Action)
	}
	if options.Tunnel != "" {
		query = query.Where("LOWER(event_records.tunnel_subdomain) = ?", options.Tunnel)
	}
	if options.Query != "" {
		like := "%" + options.Query + "%"
		query = query.Where(`
			LOWER(event_records.message) LIKE ? OR
			LOWER(event_records.action) LIKE ? OR
			LOWER(event_records.resource_type) LIKE ? OR
			LOWER(event_records.resource_id) LIKE ? OR
			LOWER(event_records.actor_email) LIKE ? OR
			LOWER(event_records.owner_email) LIKE ?
		`, like, like, like, like, like, like)
	}
	if err := query.Order("event_records.created_at desc").Limit(options.Limit).Find(&records).Error; err != nil {
		return nil, err
	}
	return records, nil
}

func (s *Service) handleExportEvents(c *gin.Context) {
	s.exportEvents(c, currentRequestAccess(c))
}

func (s *Service) handleV1ExportEvents(c *gin.Context) {
	s.exportEvents(c, currentRequestAccess(c))
}

func (s *Service) exportEvents(c *gin.Context, access requestAccess) {
	records, err := s.findEventRecords(access, eventListOptions{
		Limit:  parsePositiveLimit(c.Query("limit"), min(1000, s.auditExportLimit()), s.auditExportLimit()),
		Level:  c.Query("level"),
		Action: c.Query("action"),
		Tunnel: c.Query("tunnel"),
		Query:  c.Query("q"),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to export events"})
		return
	}

	format := normalizeAuditExportFormat(c.Query("format"))
	filename := "binboi-audit-" + time.Now().UTC().Format("20060102T150405Z")
	switch format {
	case "csv":
		filename += ".csv"
		c.Header("Content-Type", "text/csv; charset=utf-8")
	case "json":
		filename += ".json"
		c.Header("Content-Type", "application/json; charset=utf-8")
	default:
		filename += ".ndjson"
		c.Header("Content-Type", "application/x-ndjson; charset=utf-8")
	}
	c.Header("Content-Disposition", `attachment; filename="`+filename+`"`)

	switch format {
	case "csv":
		writer := csv.NewWriter(c.Writer)
		_ = writer.Write([]string{
			"created_at",
			"level",
			"action",
			"tunnel_subdomain",
			"resource_type",
			"resource_id",
			"actor_email",
			"owner_email",
			"access_scope",
			"request_id",
			"message",
			"details_json",
		})
		for _, record := range records {
			_ = writer.Write([]string{
				record.CreatedAt.UTC().Format(time.RFC3339),
				record.Level,
				record.Action,
				record.TunnelSubdomain,
				record.ResourceType,
				record.ResourceID,
				record.ActorEmail,
				record.OwnerEmail,
				record.AccessScope,
				record.RequestID,
				record.Message,
				record.DetailsJSON,
			})
		}
		writer.Flush()
		return
	case "json":
		payload := make([]EventResponse, 0, len(records))
		for _, record := range records {
			payload = append(payload, s.mapEventRecord(record))
		}
		_ = json.NewEncoder(c.Writer).Encode(payload)
		return
	default:
		encoder := json.NewEncoder(c.Writer)
		for _, record := range records {
			_ = encoder.Encode(s.mapEventRecord(record))
		}
	}
}
