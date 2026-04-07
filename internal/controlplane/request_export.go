package controlplane

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/csv"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RequestArchiveResponse struct {
	RequestID             string               `json:"request_id"`
	DeliveryID            string               `json:"delivery_id,omitempty"`
	Provider              string               `json:"provider,omitempty"`
	EventType             string               `json:"event_type,omitempty"`
	ReplayPolicy          *RequestReplayPolicy `json:"replay_policy,omitempty"`
	RequestHeaders        []string             `json:"request_headers,omitempty"`
	ResponseHeaders       []string             `json:"response_headers,omitempty"`
	Metadata              map[string]any       `json:"metadata,omitempty"`
	RequestBodyBase64     string               `json:"request_body_base64,omitempty"`
	RequestBodyText       string               `json:"request_body_text,omitempty"`
	RequestBodyTruncated  bool                 `json:"request_body_truncated"`
	ResponseBodyBase64    string               `json:"response_body_base64,omitempty"`
	ResponseBodyText      string               `json:"response_body_text,omitempty"`
	ResponseBodyTruncated bool                 `json:"response_body_truncated"`
}

type RequestExportSummary struct {
	CreatedAt         time.Time `json:"created_at"`
	ID                string    `json:"id"`
	TunnelSubdomain   string    `json:"tunnel_subdomain"`
	ReplayOfRequestID string    `json:"replay_of_request_id,omitempty"`
	DeliveryID        string    `json:"delivery_id,omitempty"`
	Kind              string    `json:"kind"`
	Provider          string    `json:"provider,omitempty"`
	EventType         string    `json:"event_type,omitempty"`
	Method            string    `json:"method"`
	Path              string    `json:"path"`
	Status            int       `json:"status"`
	DurationMs        int64     `json:"duration_ms"`
	ErrorType         string    `json:"error_type,omitempty"`
}

func normalizeRequestExportFormat(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "csv":
		return "csv"
	case "json":
		return "json"
	default:
		return "ndjson"
	}
}

func bodyTextValue(body []byte) string {
	if len(body) == 0 || !utf8.Valid(body) {
		return ""
	}
	return string(body)
}

func mapRequestArchive(record RequestRecord, archive RequestArchiveRecord) RequestArchiveResponse {
	return RequestArchiveResponse{
		RequestID:             record.ID,
		DeliveryID:            record.DeliveryID,
		Provider:              record.Provider,
		EventType:             record.EventType,
		ReplayPolicy:          replayPolicyForRequest(record),
		RequestHeaders:        splitPreviewLines(record.RequestHeaders),
		ResponseHeaders:       splitPreviewLines(record.ResponseHeaders),
		Metadata:              unmarshalRequestMetadata(record.MetadataJSON),
		RequestBodyBase64:     base64.StdEncoding.EncodeToString(archive.RequestBody),
		RequestBodyText:       bodyTextValue(archive.RequestBody),
		RequestBodyTruncated:  archive.RequestBodyTruncated,
		ResponseBodyBase64:    base64.StdEncoding.EncodeToString(archive.ResponseBody),
		ResponseBodyText:      bodyTextValue(archive.ResponseBody),
		ResponseBodyTruncated: archive.ResponseBodyTruncated,
	}
}

func (s *Service) getRequestArchive(ctx context.Context, access requestAccess, requestID string) (RequestArchiveResponse, error) {
	record, err := s.loadRequestRecord(ctx, access, requestID)
	if err != nil {
		return RequestArchiveResponse{}, err
	}
	archive, err := s.loadRequestArchive(ctx, requestID)
	if err != nil {
		return RequestArchiveResponse{}, err
	}
	return mapRequestArchive(record, archive), nil
}

func (s *Service) handleGetRequestArchive(c *gin.Context) {
	access := currentRequestAccess(c)
	archive, err := s.getRequestArchive(c.Request.Context(), access, c.Param("id"))
	s.hydrateQuotaHeaders(c, access)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
		}
		c.JSON(status, gin.H{"error": "failed to load request archive"})
		return
	}
	c.JSON(http.StatusOK, archive)
}

func (s *Service) handleV1GetRequestArchive(c *gin.Context) {
	access := currentRequestAccess(c)
	meta := s.apiMeta(access)
	archive, err := s.getRequestArchive(c.Request.Context(), access, c.Param("id"))
	s.hydrateQuotaHeaders(c, access)
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
		}
		writeV1Error(c, status, meta, "REQUEST_ARCHIVE_LOAD_FAILED", "failed to load request archive")
		return
	}
	writeV1Success(c, http.StatusOK, meta, archive)
}

func (s *Service) handleExportRequests(c *gin.Context) {
	s.exportRequests(c, currentRequestAccess(c))
}

func (s *Service) handleV1ExportRequests(c *gin.Context) {
	s.exportRequests(c, currentRequestAccess(c))
}

func (s *Service) exportRequests(c *gin.Context, access requestAccess) {
	since, until, err := parseTimeWindowFilters(c.Query("since"), c.Query("until"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	requests, err := s.listRequests(access, requestListOptions{
		Limit:       parsePositiveLimit(c.Query("limit"), min(1000, s.auditExportLimit()), s.auditExportLimit()),
		Kind:        c.Query("kind"),
		Tunnel:      c.Query("tunnel"),
		Provider:    c.Query("provider"),
		EventType:   c.Query("event_type"),
		DeliveryID:  c.Query("delivery_id"),
		Method:      c.Query("method"),
		PathPrefix:  c.Query("path_prefix"),
		Sort:        c.Query("sort"),
		Since:       since,
		Until:       until,
		Query:       c.Query("q"),
		StatusClass: c.Query("status"),
		ErrorOnly:   parseBoolQuery(c.Query("error_only")),
	})
	s.hydrateQuotaHeaders(c, access)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to export requests"})
		return
	}

	format := normalizeRequestExportFormat(c.Query("format"))
	summary := parseBoolQuery(c.Query("summary"))
	filename := "binboi-requests-" + time.Now().UTC().Format("20060102T150405Z")
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

	body, err := marshalRequestExportPayload(requests, format, summary)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to build request export"})
		return
	}

	s.writeExportResponse(c, contentType, filename, body)
}

func summarizeRequestResponse(record RequestResponse) RequestExportSummary {
	return RequestExportSummary{
		CreatedAt:         record.CreatedAt,
		ID:                record.ID,
		TunnelSubdomain:   record.TunnelSubdomain,
		ReplayOfRequestID: record.ReplayOfRequestID,
		DeliveryID:        record.DeliveryID,
		Kind:              record.Kind,
		Provider:          record.Provider,
		EventType:         record.EventType,
		Method:            record.Method,
		Path:              record.Path,
		Status:            record.Status,
		DurationMs:        record.DurationMs,
		ErrorType:         record.ErrorType,
	}
}

func marshalRequestExportPayload(requests []RequestResponse, format string, summary bool) ([]byte, error) {
	var buffer bytes.Buffer
	if summary {
		summaries := make([]RequestExportSummary, 0, len(requests))
		for _, record := range requests {
			summaries = append(summaries, summarizeRequestResponse(record))
		}

		switch format {
		case "csv":
			writer := csv.NewWriter(&buffer)
			_ = writer.Write([]string{
				"created_at",
				"id",
				"tunnel_subdomain",
				"replay_of_request_id",
				"delivery_id",
				"kind",
				"provider",
				"event_type",
				"method",
				"path",
				"status",
				"duration_ms",
				"error_type",
			})
			for _, record := range summaries {
				_ = writer.Write([]string{
					record.CreatedAt.UTC().Format(time.RFC3339),
					record.ID,
					record.TunnelSubdomain,
					record.ReplayOfRequestID,
					record.DeliveryID,
					record.Kind,
					record.Provider,
					record.EventType,
					record.Method,
					record.Path,
					strconv.Itoa(record.Status),
					strconv.FormatInt(record.DurationMs, 10),
					record.ErrorType,
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
			"id",
			"replay_of_request_id",
			"delivery_id",
			"tunnel_subdomain",
			"kind",
			"provider",
			"event_type",
			"metadata_json",
			"method",
			"path",
			"status",
			"duration_ms",
			"source",
			"target",
			"destination",
			"error_type",
			"request_preview",
			"payload_preview",
			"response_preview",
		})
		for _, record := range requests {
			_ = writer.Write([]string{
				record.CreatedAt.UTC().Format(time.RFC3339),
				record.ID,
				record.ReplayOfRequestID,
				record.DeliveryID,
				record.TunnelSubdomain,
				record.Kind,
				record.Provider,
				record.EventType,
				marshalRequestMetadata(record.Metadata),
				record.Method,
				record.Path,
				strconv.Itoa(record.Status),
				strconv.FormatInt(record.DurationMs, 10),
				record.Source,
				record.Target,
				record.Destination,
				record.ErrorType,
				record.RequestPreview,
				record.PayloadPreview,
				record.ResponsePreview,
			})
		}
		writer.Flush()
		if err := writer.Error(); err != nil {
			return nil, err
		}
		return buffer.Bytes(), nil
	case "json":
		if err := json.NewEncoder(&buffer).Encode(requests); err != nil {
			return nil, err
		}
		return buffer.Bytes(), nil
	default:
		encoder := json.NewEncoder(&buffer)
		for _, record := range requests {
			if err := encoder.Encode(record); err != nil {
				return nil, err
			}
		}
		return buffer.Bytes(), nil
	}
}
