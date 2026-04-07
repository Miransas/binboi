package controlplane

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type EventExportSummary struct {
	CreatedAt       time.Time `json:"created_at"`
	Level           string    `json:"level"`
	Message         string    `json:"message"`
	TunnelSubdomain string    `json:"tunnel_subdomain,omitempty"`
	Action          string    `json:"action,omitempty"`
	ResourceType    string    `json:"resource_type,omitempty"`
	ResourceID      string    `json:"resource_id,omitempty"`
	AccessScope     string    `json:"access_scope,omitempty"`
	RequestID       string    `json:"request_id,omitempty"`
}

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
	options.Tunnel = normalizeFilterValue(options.Tunnel, 120)
	options.ResourceType = normalizeFilterValue(options.ResourceType, 80)
	options.ResourceID = normalizeFilterValue(options.ResourceID, 160)
	options.RequestID = normalizeFilterValue(options.RequestID, 160)
	options.AccessScope = normalizeFilterValue(options.AccessScope, 80)
	options.Sort = normalizeSortDirection(options.Sort)
	options.Query = normalizeSearchQuery(options.Query)

	query := s.scopedEventQuery(access)
	if options.Since != nil {
		query = query.Where("event_records.created_at >= ?", options.Since.UTC())
	}
	if options.Until != nil {
		query = query.Where("event_records.created_at <= ?", options.Until.UTC())
	}
	if options.Level != "" {
		query = query.Where("LOWER(event_records.level) = ?", options.Level)
	}
	if options.Action != "" {
		query = query.Where("LOWER(event_records.action) = ?", options.Action)
	}
	if options.Tunnel != "" {
		query = query.Where("LOWER(event_records.tunnel_subdomain) = ?", options.Tunnel)
	}
	if options.ResourceType != "" {
		query = query.Where("LOWER(event_records.resource_type) = ?", options.ResourceType)
	}
	if options.ResourceID != "" {
		query = query.Where("LOWER(event_records.resource_id) = ?", options.ResourceID)
	}
	if options.RequestID != "" {
		query = query.Where("LOWER(event_records.request_id) = ?", options.RequestID)
	}
	if options.AccessScope != "" {
		query = query.Where("LOWER(event_records.access_scope) = ?", options.AccessScope)
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
	orderClause := "event_records.created_at desc"
	if options.Sort == "asc" {
		orderClause = "event_records.created_at asc"
	}
	if err := query.Order(orderClause).Limit(options.Limit).Find(&records).Error; err != nil {
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
	since, until, err := parseTimeWindowFilters(c.Query("since"), c.Query("until"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	records, err := s.findEventRecords(access, eventListOptions{
		Limit:        parsePositiveLimit(c.Query("limit"), min(1000, s.auditExportLimit()), s.auditExportLimit()),
		Level:        c.Query("level"),
		Action:       c.Query("action"),
		Tunnel:       c.Query("tunnel"),
		ResourceType: c.Query("resource_type"),
		ResourceID:   c.Query("resource_id"),
		RequestID:    c.Query("request_id"),
		AccessScope:  c.Query("access_scope"),
		Sort:         c.Query("sort"),
		Since:        since,
		Until:        until,
		Query:        c.Query("q"),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to export events"})
		return
	}

	format := normalizeAuditExportFormat(c.Query("format"))
	summary := parseBoolQuery(c.Query("summary"))
	filename := "binboi-audit-" + time.Now().UTC().Format("20060102T150405Z")
	if summary {
		filename += "-summary"
	}
	contentType := "application/x-ndjson; charset=utf-8"
	switch format {
	case "csv":
		filename += ".csv"
		contentType = "text/csv; charset=utf-8"
	case "json":
		filename += ".json"
		contentType = "application/json; charset=utf-8"
	default:
		filename += ".ndjson"
	}

	body, err := s.marshalEventExportPayload(records, format, summary)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to build event export"})
		return
	}

	s.writeExportResponse(c, contentType, filename, body)
}

func summarizeEventRecord(record EventRecord) EventExportSummary {
	return EventExportSummary{
		CreatedAt:       record.CreatedAt,
		Level:           record.Level,
		Message:         record.Message,
		TunnelSubdomain: record.TunnelSubdomain,
		Action:          record.Action,
		ResourceType:    record.ResourceType,
		ResourceID:      record.ResourceID,
		AccessScope:     record.AccessScope,
		RequestID:       record.RequestID,
	}
}

func (s *Service) marshalEventExportPayload(records []EventRecord, format string, summary bool) ([]byte, error) {
	var buffer bytes.Buffer
	if summary {
		summaries := make([]EventExportSummary, 0, len(records))
		for _, record := range records {
			summaries = append(summaries, summarizeEventRecord(record))
		}

		switch format {
		case "csv":
			writer := csv.NewWriter(&buffer)
			_ = writer.Write([]string{
				"created_at",
				"level",
				"message",
				"tunnel_subdomain",
				"action",
				"resource_type",
				"resource_id",
				"access_scope",
				"request_id",
			})
			for _, record := range summaries {
				_ = writer.Write([]string{
					record.CreatedAt.UTC().Format(time.RFC3339),
					record.Level,
					record.Message,
					record.TunnelSubdomain,
					record.Action,
					record.ResourceType,
					record.ResourceID,
					record.AccessScope,
					record.RequestID,
				})
			}
			writer.Flush()
			if err := writer.Error(); err != nil {
				return nil, err
			}
			return buffer.Bytes(), nil
		case "json":
			if err := json.NewEncoder(&buffer).Encode(summaries); err != nil {
				return nil, err
			}
			return buffer.Bytes(), nil
		default:
			encoder := json.NewEncoder(&buffer)
			for _, record := range summaries {
				if err := encoder.Encode(record); err != nil {
					return nil, err
				}
			}
			return buffer.Bytes(), nil
		}
	}

	switch format {
	case "csv":
		writer := csv.NewWriter(&buffer)
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
		if err := writer.Error(); err != nil {
			return nil, err
		}
		return buffer.Bytes(), nil
	case "json":
		payload := make([]EventResponse, 0, len(records))
		for _, record := range records {
			payload = append(payload, s.mapEventRecord(record))
		}
		if err := json.NewEncoder(&buffer).Encode(payload); err != nil {
			return nil, err
		}
		return buffer.Bytes(), nil
	default:
		encoder := json.NewEncoder(&buffer)
		for _, record := range records {
			if err := encoder.Encode(s.mapEventRecord(record)); err != nil {
				return nil, err
			}
		}
		return buffer.Bytes(), nil
	}
}
