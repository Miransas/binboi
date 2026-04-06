package controlplane

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/textproto"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RequestReplayResponse struct {
	OriginalRequestID string               `json:"original_request_id"`
	ReplayedRequestID string               `json:"replayed_request_id,omitempty"`
	TunnelSubdomain   string               `json:"tunnel_subdomain"`
	Method            string               `json:"method"`
	Path              string               `json:"path"`
	ReplayAttempt     int64                `json:"replay_attempt"`
	ReplayPolicy      *RequestReplayPolicy `json:"replay_policy,omitempty"`
	ProxyStatus       int                  `json:"proxy_status"`
	ResponsePreview   string               `json:"response_preview,omitempty"`
	ReplayedAt        time.Time            `json:"replayed_at"`
}

func baseReplayResponse(record RequestRecord) RequestReplayResponse {
	return RequestReplayResponse{
		OriginalRequestID: record.ID,
		TunnelSubdomain:   record.TunnelSubdomain,
		Method:            record.Method,
		Path:              record.Path,
		ReplayPolicy:      replayPolicyForRequest(record),
	}
}

func (s *Service) requestRecordQuery(ctx context.Context, access requestAccess) *gorm.DB {
	query := s.db.WithContext(ctx).Model(&RequestRecord{})
	if access.Identity != nil && s.authProvider != nil && s.authProvider.Enabled() && access.Identity.AuthMode != "instance-token-preview" {
		query = query.Joins("JOIN tunnel_records ON tunnel_records.id = request_records.tunnel_id").
			Where("tunnel_records.owner_user_id = ?", access.Identity.UserID)
	}
	return query
}

func (s *Service) loadRequestRecord(ctx context.Context, access requestAccess, requestID string) (RequestRecord, error) {
	var record RequestRecord
	err := s.requestRecordQuery(ctx, access).
		Where("request_records.id = ?", strings.TrimSpace(requestID)).
		First(&record).
		Error
	return record, err
}

func (s *Service) loadRequestArchive(ctx context.Context, requestID string) (RequestArchiveRecord, error) {
	var archive RequestArchiveRecord
	err := s.db.WithContext(ctx).
		Where("request_id = ?", strings.TrimSpace(requestID)).
		First(&archive).
		Error
	return archive, err
}

func sanitizeReplayHeaders(header http.Header) http.Header {
	clean := make(http.Header, len(header))
	for key, values := range header {
		canonical := textproto.CanonicalMIMEHeaderKey(strings.TrimSpace(key))
		if canonical == "" {
			continue
		}

		switch canonical {
		case "Connection", "Proxy-Connection", "Keep-Alive", "Transfer-Encoding", "Upgrade", "Host", "Content-Length":
			continue
		}

		clean[canonical] = append([]string(nil), values...)
	}
	return clean
}

func (s *Service) replayRecordedRequest(ctx context.Context, requestID string, access requestAccess) (RequestReplayResponse, error) {
	record, err := s.loadRequestRecord(ctx, access, requestID)
	if err != nil {
		return RequestReplayResponse{}, err
	}
	result := baseReplayResponse(record)

	archive, err := s.loadRequestArchive(ctx, requestID)
	if err != nil {
		return result, err
	}
	if err := s.ensureReplayEligible(ctx, access, record, archive); err != nil {
		return result, err
	}
	replayAttempt, err := s.nextReplayAttempt(ctx, access, record.ID)
	if err != nil {
		return result, err
	}
	result.ReplayAttempt = replayAttempt

	replayURL := "http://" + record.TunnelSubdomain + "." + s.cfg.BaseDomain + fallbackString(record.Path, "/")
	req := httptest.NewRequest(record.Method, replayURL, bytes.NewReader(archive.RequestBody))
	req.Host = record.TunnelSubdomain + "." + s.cfg.BaseDomain
	req.RemoteAddr = "127.0.0.1:0"
	req.Header = sanitizeReplayHeaders(headersFromJSON(archive.RequestHeadersJSON))
	req.Header.Set("X-Binboi-Replay-Of", record.ID)
	req.Header.Set("X-Binboi-Replay-Origin", "controlplane")
	req.Header.Set("X-Binboi-Redelivery", "true")
	req.Header.Set("X-Binboi-Redelivery-Attempt", strconv.FormatInt(replayAttempt, 10))
	if policy := result.ReplayPolicy; policy != nil {
		req.Header.Set("X-Binboi-Redelivery-Mode", policy.Mode)
		req.Header.Set("X-Binboi-Signature-Present", strconv.FormatBool(policy.SignaturePresent))
		if policy.Provider != "" {
			req.Header.Set("X-Binboi-Original-Provider", policy.Provider)
		}
		if policy.EventType != "" {
			req.Header.Set("X-Binboi-Original-Event-Type", policy.EventType)
		}
		if policy.DeliveryID != "" {
			req.Header.Set("X-Binboi-Original-Delivery-ID", policy.DeliveryID)
		}
		if policy.DedupeKey != "" {
			req.Header.Set("X-Binboi-Redelivery-Key", policy.DedupeKey)
		}
	}

	recorder := httptest.NewRecorder()
	s.ServeProxy().ServeHTTP(recorder, req)

	var replayed RequestRecord
	query := s.requestRecordQuery(ctx, access).
		Where("request_records.replay_of_request_id = ?", record.ID).
		Order("request_records.created_at desc")
	if err := query.First(&replayed).Error; err != nil {
		result.ProxyStatus = recorder.Code
		result.ResponsePreview = compactPreview(recorder.Body.String(), maxBodyPreviewBytes)
		result.ReplayedAt = time.Now().UTC()
		return result, fmt.Errorf("load replay result: %w", err)
	}

	result.ReplayedRequestID = replayed.ID
	result.ProxyStatus = recorder.Code
	result.ResponsePreview = compactPreview(recorder.Body.String(), maxBodyPreviewBytes)
	result.ReplayedAt = time.Now().UTC()
	return result, nil
}

func replayHTTPStatus(err error, result RequestReplayResponse) int {
	if err != nil {
		if result.ProxyStatus >= 400 {
			return result.ProxyStatus
		}
		switch {
		case errors.Is(err, gorm.ErrRecordNotFound):
			return http.StatusNotFound
		case isQuotaError(err):
			return http.StatusForbidden
		case isReplayBlockedError(err):
			return http.StatusConflict
		default:
			return http.StatusInternalServerError
		}
	}

	if result.ProxyStatus >= 400 {
		return result.ProxyStatus
	}
	return http.StatusOK
}

func replayAuditEvent(err error, result RequestReplayResponse) (string, string, string) {
	if err != nil {
		if isQuotaError(err) {
			return "request.replay.quota", "warn", fmt.Sprintf("Replay quota reached for request %s", fallbackString(result.OriginalRequestID, "unknown"))
		}
		if isReplayBlockedError(err) {
			return "request.replay.blocked", "warn", fmt.Sprintf("Blocked replay for request %s", fallbackString(result.OriginalRequestID, "unknown"))
		}
		return "request.replay.failed", "error", fmt.Sprintf("Replay failed for request %s", fallbackString(result.OriginalRequestID, "unknown"))
	}
	if result.ProxyStatus >= http.StatusBadRequest {
		level := "warn"
		if result.ProxyStatus >= http.StatusInternalServerError {
			level = "error"
		}
		return "request.replay.failed", level, fmt.Sprintf("Replay completed with upstream error for request %s", fallbackString(result.OriginalRequestID, "unknown"))
	}
	return "request.replay", "info", fmt.Sprintf("Replayed request %s to %s", result.OriginalRequestID, result.TunnelSubdomain)
}

func (s *Service) recordReplayOutcome(err error, result RequestReplayResponse) {
	if err != nil {
		if isReplayBlockedError(err) || isQuotaError(err) {
			s.recordRequestReplayBlocked()
			return
		}
		s.recordRequestReplayFailed()
		return
	}
	if result.ProxyStatus >= http.StatusBadRequest {
		s.recordRequestReplayFailed()
		return
	}
	s.recordRequestReplaySuccess()
}

func (s *Service) emitReplayAuditEvent(c *gin.Context, requestID string, result RequestReplayResponse, err error) {
	action, level, message := replayAuditEvent(err, result)
	resourceID := strings.TrimSpace(requestID)
	if result.OriginalRequestID != "" {
		resourceID = result.OriginalRequestID
	}

	details := map[string]any{
		"path": result.Path,
	}
	if result.ReplayedRequestID != "" {
		details["replayed_request_id"] = result.ReplayedRequestID
	}
	if result.ProxyStatus > 0 {
		details["proxy_status"] = result.ProxyStatus
	}
	if err != nil {
		details["reason"] = err.Error()
	}
	if result.ReplayAttempt > 0 {
		details["replay_attempt"] = result.ReplayAttempt
	}
	if policy := result.ReplayPolicy; policy != nil {
		if policy.Provider != "" {
			details["provider"] = policy.Provider
		}
		if policy.EventType != "" {
			details["event_type"] = policy.EventType
		}
		if policy.DeliveryID != "" {
			details["delivery_id"] = policy.DeliveryID
		}
		if policy.Mode != "" {
			details["replay_mode"] = policy.Mode
		}
		if policy.DedupeKey != "" {
			details["dedupe_key"] = policy.DedupeKey
		}
		if policy.SignaturePresent {
			details["signature_present"] = true
		}
		if policy.VerificationHint != "" {
			details["verification_hint"] = policy.VerificationHint
		}
	}

	s.emitAuditEvent(c, auditEventOptions{
		Level:           level,
		Message:         message,
		Action:          action,
		ResourceType:    "request",
		ResourceID:      resourceID,
		TunnelSubdomain: result.TunnelSubdomain,
		Details:         details,
	}, true)
}

func (s *Service) handleReplayRequest(c *gin.Context) {
	access := currentRequestAccess(c)
	result, err := s.replayRecordedRequest(c.Request.Context(), c.Param("id"), access)
	s.hydrateQuotaHeaders(c, access)
	s.recordReplayOutcome(err, result)
	s.emitReplayAuditEvent(c, c.Param("id"), result, err)
	if err != nil {
		c.JSON(replayHTTPStatus(err, result), gin.H{"error": err.Error()})
		return
	}
	c.JSON(replayHTTPStatus(nil, result), result)
}

func (s *Service) handleV1ReplayRequest(c *gin.Context) {
	access := currentRequestAccess(c)
	meta := s.apiMeta(access)
	result, err := s.replayRecordedRequest(c.Request.Context(), c.Param("id"), access)
	s.hydrateQuotaHeaders(c, access)
	s.recordReplayOutcome(err, result)
	s.emitReplayAuditEvent(c, c.Param("id"), result, err)
	if err != nil {
		writeV1Error(c, replayHTTPStatus(err, result), meta, "REQUEST_REPLAY_FAILED", err.Error())
		return
	}
	writeV1Success(c, replayHTTPStatus(nil, result), meta, result)
}
