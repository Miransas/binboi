package controlplane

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"sync/atomic"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const requestIDHeader = "X-Request-ID"

type runtimeMetrics struct {
	apiRequestsTotal        atomic.Uint64
	apiRequestErrorsTotal   atomic.Uint64
	apiRateLimitedTotal     atomic.Uint64
	proxyRequestsTotal      atomic.Uint64
	proxyRequestErrorsTotal atomic.Uint64
	proxyRateLimitedTotal   atomic.Uint64
	tunnelConnectionsTotal  atomic.Uint64
	tunnelRejectionsTotal   atomic.Uint64
}

type MetricsSnapshot struct {
	InstanceName            string `json:"instance_name"`
	ManagedDomain           string `json:"managed_domain"`
	AuthMode                string `json:"auth_mode"`
	UptimeSeconds           int64  `json:"uptime_seconds"`
	ReservedTunnels         int64  `json:"reserved_tunnels"`
	ActiveTunnelSessions    int    `json:"active_tunnel_sessions"`
	DomainsTotal            int64  `json:"domains_total"`
	PendingDomainsTotal     int64  `json:"pending_domains_total"`
	StoredEventsTotal       int64  `json:"stored_events_total"`
	StoredRequestsTotal     int64  `json:"stored_requests_total"`
	LogSubscribers          int    `json:"log_subscribers"`
	APIRequestsTotal        uint64 `json:"api_requests_total"`
	APIRequestErrorsTotal   uint64 `json:"api_request_errors_total"`
	APIRateLimitedTotal     uint64 `json:"api_rate_limited_total"`
	ProxyRequestsTotal      uint64 `json:"proxy_requests_total"`
	ProxyRequestErrorsTotal uint64 `json:"proxy_request_errors_total"`
	ProxyRateLimitedTotal   uint64 `json:"proxy_rate_limited_total"`
	TunnelConnectionsTotal  uint64 `json:"tunnel_connections_total"`
	TunnelRejectionsTotal   uint64 `json:"tunnel_rejections_total"`
}

func (s *Service) requestContext() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := incomingRequestID(c.Request)
		c.Set("binboi.request_id", requestID)
		c.Writer.Header().Set(requestIDHeader, requestID)
		c.Request.Header.Set(requestIDHeader, requestID)
		c.Next()
	}
}

func (s *Service) requestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()

		status := c.Writer.Status()
		s.recordAPIRequest(status)
		s.logHTTPRequest("api", requestIDFromContext(c), c.Request, status, time.Since(start), len(c.Errors) > 0)
	}
}

func (s *Service) withProxyObservability(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := incomingRequestID(r)
		start := time.Now()

		r = r.Clone(r.Context())
		r.Header.Set(requestIDHeader, requestID)

		capture := newStatusCapturingResponseWriter(w)
		capture.Header().Set(requestIDHeader, requestID)
		next.ServeHTTP(capture, r)

		status := capture.Status()
		s.recordProxyRequest(status)
		s.logHTTPRequest("proxy", requestID, r, status, time.Since(start), status >= http.StatusInternalServerError)
	})
}

func (s *Service) handleMetrics(c *gin.Context) {
	snapshot, err := s.metricsSnapshot()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to build metrics snapshot"})
		return
	}
	c.JSON(http.StatusOK, snapshot)
}

func (s *Service) handleV1Metrics(c *gin.Context) {
	access := currentRequestAccess(c)
	meta := s.apiMeta(access)
	snapshot, err := s.metricsSnapshot()
	if err != nil {
		writeV1Error(c, http.StatusInternalServerError, meta, "METRICS_SNAPSHOT_FAILED", "failed to build metrics snapshot")
		return
	}
	writeV1Success(c, http.StatusOK, meta, snapshot)
}

func (s *Service) handlePrometheusMetrics(c *gin.Context) {
	snapshot, err := s.metricsSnapshot()
	if err != nil {
		c.String(http.StatusInternalServerError, "failed to build metrics snapshot\n")
		return
	}

	c.Data(http.StatusOK, "text/plain; version=0.0.4; charset=utf-8", []byte(renderPrometheusMetrics(snapshot)))
}

func (s *Service) metricsSnapshot() (MetricsSnapshot, error) {
	var snapshot MetricsSnapshot

	snapshot.InstanceName = fallbackString(s.cfg.InstanceName, defaultInstance)
	snapshot.ManagedDomain = fallbackString(s.cfg.BaseDomain, defaultBaseDomain)
	snapshot.AuthMode = s.currentAuthMode()
	snapshot.UptimeSeconds = int64(time.Since(s.startedAt).Seconds())
	snapshot.ActiveTunnelSessions = s.activeTunnelCount()
	snapshot.LogSubscribers = s.activeLogSubscribers()
	snapshot.APIRequestsTotal = s.metrics.apiRequestsTotal.Load()
	snapshot.APIRequestErrorsTotal = s.metrics.apiRequestErrorsTotal.Load()
	snapshot.APIRateLimitedTotal = s.metrics.apiRateLimitedTotal.Load()
	snapshot.ProxyRequestsTotal = s.metrics.proxyRequestsTotal.Load()
	snapshot.ProxyRequestErrorsTotal = s.metrics.proxyRequestErrorsTotal.Load()
	snapshot.ProxyRateLimitedTotal = s.metrics.proxyRateLimitedTotal.Load()
	snapshot.TunnelConnectionsTotal = s.metrics.tunnelConnectionsTotal.Load()
	snapshot.TunnelRejectionsTotal = s.metrics.tunnelRejectionsTotal.Load()

	var countErr error
	countErr = joinCountError(countErr, s.db.Model(&TunnelRecord{}).Count(&snapshot.ReservedTunnels).Error)
	countErr = joinCountError(countErr, s.db.Model(&DomainRecord{}).Count(&snapshot.DomainsTotal).Error)
	countErr = joinCountError(countErr, s.db.Model(&DomainRecord{}).Where("status = ?", "PENDING").Count(&snapshot.PendingDomainsTotal).Error)
	countErr = joinCountError(countErr, s.db.Model(&EventRecord{}).Count(&snapshot.StoredEventsTotal).Error)
	countErr = joinCountError(countErr, s.db.Model(&RequestRecord{}).Count(&snapshot.StoredRequestsTotal).Error)

	return snapshot, countErr
}

func (s *Service) currentAuthMode() string {
	if s.authProvider != nil && s.authProvider.Enabled() {
		return "personal-access-token"
	}
	return "instance-token-preview"
}

func (s *Service) activeLogSubscribers() int {
	s.logMu.Lock()
	defer s.logMu.Unlock()
	return len(s.clients)
}

func (s *Service) recordAPIRequest(status int) {
	s.metrics.apiRequestsTotal.Add(1)
	if status >= http.StatusBadRequest {
		s.metrics.apiRequestErrorsTotal.Add(1)
	}
}

func (s *Service) recordAPIRateLimited() {
	s.metrics.apiRateLimitedTotal.Add(1)
}

func (s *Service) recordProxyRequest(status int) {
	s.metrics.proxyRequestsTotal.Add(1)
	if status >= http.StatusBadRequest {
		s.metrics.proxyRequestErrorsTotal.Add(1)
	}
}

func (s *Service) recordProxyRateLimited() {
	s.metrics.proxyRateLimitedTotal.Add(1)
}

func (s *Service) recordTunnelConnectionAccepted() {
	s.metrics.tunnelConnectionsTotal.Add(1)
}

func (s *Service) recordTunnelConnectionRejected() {
	s.metrics.tunnelRejectionsTotal.Add(1)
}

func (s *Service) logRuntimeEvent(level slog.Level, message string, attrs ...any) {
	slog.Log(context.Background(), level, message, attrs...)
}

func (s *Service) logHTTPRequest(component, requestID string, r *http.Request, status int, duration time.Duration, hasError bool) {
	attrs := []any{
		"component", component,
		"request_id", fallbackString(requestID, "unknown"),
		"method", r.Method,
		"path", r.URL.Path,
		"host", r.Host,
		"status", status,
		"duration_ms", duration.Milliseconds(),
		"remote_addr", r.RemoteAddr,
		"user_agent", compactPreview(r.UserAgent(), 120),
	}

	level := slog.LevelInfo
	if status >= http.StatusInternalServerError || hasError {
		level = slog.LevelError
	} else if status >= http.StatusBadRequest {
		level = slog.LevelWarn
	}

	s.logRuntimeEvent(level, "http request completed", attrs...)
}

func renderPrometheusMetrics(snapshot MetricsSnapshot) string {
	var builder strings.Builder

	writeMetric := func(name, metricType, help string, value any) {
		builder.WriteString("# HELP ")
		builder.WriteString(name)
		builder.WriteString(" ")
		builder.WriteString(help)
		builder.WriteString("\n# TYPE ")
		builder.WriteString(name)
		builder.WriteString(" ")
		builder.WriteString(metricType)
		builder.WriteString("\n")
		builder.WriteString(name)
		builder.WriteString(" ")
		builder.WriteString(fmt.Sprint(value))
		builder.WriteString("\n")
	}

	writeMetric("binboi_uptime_seconds", "gauge", "Seconds since the control plane started.", snapshot.UptimeSeconds)
	writeMetric("binboi_reserved_tunnels", "gauge", "Number of reserved tunnels in SQLite.", snapshot.ReservedTunnels)
	writeMetric("binboi_active_tunnel_sessions", "gauge", "Number of active tunnel sessions.", snapshot.ActiveTunnelSessions)
	writeMetric("binboi_domains_total", "gauge", "Number of managed and custom domains.", snapshot.DomainsTotal)
	writeMetric("binboi_pending_domains_total", "gauge", "Number of custom domains pending verification.", snapshot.PendingDomainsTotal)
	writeMetric("binboi_stored_events_total", "gauge", "Number of persisted event rows.", snapshot.StoredEventsTotal)
	writeMetric("binboi_stored_requests_total", "gauge", "Number of persisted request rows.", snapshot.StoredRequestsTotal)
	writeMetric("binboi_log_subscribers", "gauge", "Number of connected live log websocket clients.", snapshot.LogSubscribers)
	writeMetric("binboi_api_requests_total", "counter", "Total number of control plane API requests.", snapshot.APIRequestsTotal)
	writeMetric("binboi_api_request_errors_total", "counter", "Total number of control plane API requests ending with 4xx or 5xx.", snapshot.APIRequestErrorsTotal)
	writeMetric("binboi_api_rate_limited_total", "counter", "Total number of control plane API requests rejected by rate limiting.", snapshot.APIRateLimitedTotal)
	writeMetric("binboi_proxy_requests_total", "counter", "Total number of public proxy requests.", snapshot.ProxyRequestsTotal)
	writeMetric("binboi_proxy_request_errors_total", "counter", "Total number of public proxy requests ending with 4xx or 5xx.", snapshot.ProxyRequestErrorsTotal)
	writeMetric("binboi_proxy_rate_limited_total", "counter", "Total number of public proxy requests rejected by rate limiting.", snapshot.ProxyRateLimitedTotal)
	writeMetric("binboi_tunnel_connections_total", "counter", "Total number of accepted tunnel connections.", snapshot.TunnelConnectionsTotal)
	writeMetric("binboi_tunnel_rejections_total", "counter", "Total number of rejected tunnel handshakes.", snapshot.TunnelRejectionsTotal)

	builder.WriteString("# HELP binboi_build_info Static metadata about the running control plane.\n")
	builder.WriteString("# TYPE binboi_build_info gauge\n")
	builder.WriteString(fmt.Sprintf(
		"binboi_build_info{instance_name=\"%s\",managed_domain=\"%s\",auth_mode=\"%s\"} 1\n",
		prometheusLabelValue(snapshot.InstanceName),
		prometheusLabelValue(snapshot.ManagedDomain),
		prometheusLabelValue(snapshot.AuthMode),
	))

	return builder.String()
}

func incomingRequestID(r *http.Request) string {
	if r == nil {
		return uuid.NewString()
	}
	if value := strings.TrimSpace(r.Header.Get(requestIDHeader)); value != "" && len(value) <= 128 {
		return value
	}
	return uuid.NewString()
}

func requestIDFromContext(c *gin.Context) string {
	if c == nil {
		return ""
	}
	if value, ok := c.Get("binboi.request_id"); ok {
		if requestID, ok := value.(string); ok {
			return requestID
		}
	}
	return ""
}

func joinCountError(existing, next error) error {
	if next == nil {
		return existing
	}
	if existing == nil {
		return next
	}
	return errors.Join(existing, next)
}

func prometheusLabelValue(value string) string {
	value = strings.ReplaceAll(value, "\\", "\\\\")
	value = strings.ReplaceAll(value, "\"", "\\\"")
	value = strings.ReplaceAll(value, "\n", " ")
	return value
}

func slogLevelFromString(level string) slog.Level {
	switch strings.ToLower(strings.TrimSpace(level)) {
	case "debug":
		return slog.LevelDebug
	case "warn", "warning":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
