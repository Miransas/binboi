package controlplane

import (
	"bufio"
	"bytes"
	"compress/gzip"
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/hashicorp/yamux"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type stubAuthProvider struct {
	identity  *AuthIdentity
	err       error
	enabled   bool
	healthErr error
}

func (s stubAuthProvider) Enabled() bool {
	return s.enabled
}

func (s stubAuthProvider) Mode() string {
	if s.enabled {
		return "personal-access-token"
	}
	return "instance-token-preview"
}

func (s stubAuthProvider) ValidateAccessToken(_ context.Context, raw string) (*AuthIdentity, error) {
	if !s.enabled {
		return nil, errors.New("auth disabled")
	}
	if s.err != nil {
		return nil, s.err
	}
	if raw == "" {
		return nil, errors.New("missing token")
	}
	return s.identity, nil
}

func (s stubAuthProvider) LookupUserPlan(_ context.Context, userID string) (string, error) {
	if !s.enabled {
		return "", errors.New("auth disabled")
	}
	if s.err != nil {
		return "", s.err
	}
	if s.identity != nil && s.identity.UserID == userID {
		return s.identity.Plan, nil
	}
	return "FREE", nil
}

func (s stubAuthProvider) HealthCheck(_ context.Context) error {
	if !s.enabled {
		return nil
	}
	return s.healthErr
}

func (s stubAuthProvider) Close() error {
	return nil
}

func newTestService(t *testing.T) *Service {
	t.Helper()

	db, err := gorm.Open(sqlite.Open(t.TempDir()+"/controlplane.db"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite database: %v", err)
	}
	if err := db.AutoMigrate(&InstanceToken{}, &TunnelRecord{}, &DomainRecord{}, &EventRecord{}, &RequestRecord{}, &RequestArchiveRecord{}); err != nil {
		t.Fatalf("auto migrate: %v", err)
	}

	service := &Service{
		cfg: Config{
			BaseDomain:            "binboi.localhost",
			PublicScheme:          "http",
			PublicPort:            8000,
			DefaultRegion:         "local",
			DomainVerifyInterval:  defaultDomainVerifyInterval,
			DomainVerifyBatchSize: defaultDomainVerifyBatchSize,
			DomainLookupTimeout:   defaultDomainLookupTimeout,
			RequestReplayLimit:    defaultRequestReplayLimit,
			APIRateLimit:          defaultAPIRateLimit,
			APIRateBurst:          defaultAPIRateBurst,
			ProxyRateLimit:        defaultProxyRateLimit,
			ProxyRateBurst:        defaultProxyRateBurst,
		},
		db:           db,
		sessions:     make(map[string]*activeSession),
		clients:      make(map[*websocket.Conn]struct{}),
		backlog:      make([]string, 0, maxLogBacklog),
		authProvider: &authProvider{},
	}
	service.lookupTXT = func(ctx context.Context, host string) ([]string, error) {
		return []string{}, nil
	}
	service.configureRuntimeGuards()

	if err := service.ensureDefaults(); err != nil {
		t.Fatalf("ensure defaults: %v", err)
	}

	return service
}

func TestNormalizeSubdomain(t *testing.T) {
	value, err := normalizeSubdomain("My-App")
	if err != nil {
		t.Fatalf("normalizeSubdomain returned error: %v", err)
	}
	if value != "my-app" {
		t.Fatalf("expected my-app, got %s", value)
	}
}

func TestNormalizeTarget(t *testing.T) {
	target, port, err := normalizeTarget("localhost:4000")
	if err != nil {
		t.Fatalf("normalizeTarget returned error: %v", err)
	}
	if target != "http://localhost:4000" {
		t.Fatalf("unexpected target: %s", target)
	}
	if port != 4000 {
		t.Fatalf("unexpected port: %d", port)
	}
}

func TestLoadConfigFromEnvParsesTimeoutsAndLimits(t *testing.T) {
	t.Setenv("BINBOI_READ_HEADER_TIMEOUT", "2s")
	t.Setenv("BINBOI_READ_TIMEOUT", "11s")
	t.Setenv("BINBOI_WRITE_TIMEOUT", "21s")
	t.Setenv("BINBOI_IDLE_TIMEOUT", "31s")
	t.Setenv("BINBOI_SHUTDOWN_TIMEOUT", "7s")
	t.Setenv("BINBOI_EVENT_LIMIT", "75")
	t.Setenv("BINBOI_REQUEST_LIMIT", "250")
	t.Setenv("BINBOI_STORED_EVENT_LIMIT", "1500")
	t.Setenv("BINBOI_STORED_REQUEST_LIMIT", "5500")
	t.Setenv("BINBOI_AUDIT_EXPORT_LIMIT", "9000")
	t.Setenv("BINBOI_EXPORT_MAX_BYTES", "1048576")
	t.Setenv("BINBOI_EVENT_RETENTION_MAX_AGE", "72h")
	t.Setenv("BINBOI_REQUEST_RETENTION_MAX_AGE", "24h")
	t.Setenv("BINBOI_CAPTURE_BODY_LIMIT", "65536")
	t.Setenv("BINBOI_DOMAIN_VERIFY_INTERVAL", "45s")
	t.Setenv("BINBOI_DOMAIN_VERIFY_BATCH_SIZE", "19")
	t.Setenv("BINBOI_DOMAIN_LOOKUP_TIMEOUT", "3s")
	t.Setenv("BINBOI_REQUEST_REPLAY_LIMIT", "4")
	t.Setenv("BINBOI_API_RATE_LIMIT", "320")
	t.Setenv("BINBOI_API_RATE_BURST", "44")
	t.Setenv("BINBOI_PROXY_RATE_LIMIT", "980")
	t.Setenv("BINBOI_PROXY_RATE_BURST", "120")
	t.Setenv("BINBOI_PROXY_TLS_ADDR", ":8443")
	t.Setenv("BINBOI_ACME_CACHE_DIR", "./acme-cache")
	t.Setenv("BINBOI_ACME_EMAIL", "ops@binboi.test")

	cfg := LoadConfigFromEnv()

	if cfg.ReadHeaderTimeout != 2*time.Second {
		t.Fatalf("ReadHeaderTimeout = %s, want 2s", cfg.ReadHeaderTimeout)
	}
	if cfg.ReadTimeout != 11*time.Second {
		t.Fatalf("ReadTimeout = %s, want 11s", cfg.ReadTimeout)
	}
	if cfg.WriteTimeout != 21*time.Second {
		t.Fatalf("WriteTimeout = %s, want 21s", cfg.WriteTimeout)
	}
	if cfg.IdleTimeout != 31*time.Second {
		t.Fatalf("IdleTimeout = %s, want 31s", cfg.IdleTimeout)
	}
	if cfg.ShutdownTimeout != 7*time.Second {
		t.Fatalf("ShutdownTimeout = %s, want 7s", cfg.ShutdownTimeout)
	}
	if cfg.RecentEventLimit != 75 {
		t.Fatalf("RecentEventLimit = %d, want 75", cfg.RecentEventLimit)
	}
	if cfg.RecentRequestLimit != 250 {
		t.Fatalf("RecentRequestLimit = %d, want 250", cfg.RecentRequestLimit)
	}
	if cfg.StoredEventLimit != 1500 {
		t.Fatalf("StoredEventLimit = %d, want 1500", cfg.StoredEventLimit)
	}
	if cfg.StoredRequestLimit != 5500 {
		t.Fatalf("StoredRequestLimit = %d, want 5500", cfg.StoredRequestLimit)
	}
	if cfg.AuditExportLimit != 9000 {
		t.Fatalf("AuditExportLimit = %d, want 9000", cfg.AuditExportLimit)
	}
	if cfg.ExportMaxBytes != 1048576 {
		t.Fatalf("ExportMaxBytes = %d, want 1048576", cfg.ExportMaxBytes)
	}
	if cfg.EventRetentionMaxAge != 72*time.Hour {
		t.Fatalf("EventRetentionMaxAge = %s, want 72h", cfg.EventRetentionMaxAge)
	}
	if cfg.RequestRetentionMaxAge != 24*time.Hour {
		t.Fatalf("RequestRetentionMaxAge = %s, want 24h", cfg.RequestRetentionMaxAge)
	}
	if cfg.CaptureBodyLimit != 65536 {
		t.Fatalf("CaptureBodyLimit = %d, want 65536", cfg.CaptureBodyLimit)
	}
	if cfg.DomainVerifyInterval != 45*time.Second {
		t.Fatalf("DomainVerifyInterval = %s, want 45s", cfg.DomainVerifyInterval)
	}
	if cfg.DomainVerifyBatchSize != 19 {
		t.Fatalf("DomainVerifyBatchSize = %d, want 19", cfg.DomainVerifyBatchSize)
	}
	if cfg.DomainLookupTimeout != 3*time.Second {
		t.Fatalf("DomainLookupTimeout = %s, want 3s", cfg.DomainLookupTimeout)
	}
	if cfg.RequestReplayLimit != 4 {
		t.Fatalf("RequestReplayLimit = %d, want 4", cfg.RequestReplayLimit)
	}
	if cfg.APIRateLimit != 320 {
		t.Fatalf("APIRateLimit = %d, want 320", cfg.APIRateLimit)
	}
	if cfg.APIRateBurst != 44 {
		t.Fatalf("APIRateBurst = %d, want 44", cfg.APIRateBurst)
	}
	if cfg.ProxyRateLimit != 980 {
		t.Fatalf("ProxyRateLimit = %d, want 980", cfg.ProxyRateLimit)
	}
	if cfg.ProxyRateBurst != 120 {
		t.Fatalf("ProxyRateBurst = %d, want 120", cfg.ProxyRateBurst)
	}
	if cfg.ProxyTLSAddr != ":8443" {
		t.Fatalf("ProxyTLSAddr = %q, want %q", cfg.ProxyTLSAddr, ":8443")
	}
	if cfg.ACMECacheDir != "./acme-cache" {
		t.Fatalf("ACMECacheDir = %q, want %q", cfg.ACMECacheDir, "./acme-cache")
	}
	if cfg.ACMEEmail != "ops@binboi.test" {
		t.Fatalf("ACMEEmail = %q, want %q", cfg.ACMEEmail, "ops@binboi.test")
	}
}

func TestLoadConfigFromEnvInfersHTTPSWhenTLSListenerEnabled(t *testing.T) {
	t.Setenv("BINBOI_PROXY_ADDR", ":9082")
	t.Setenv("BINBOI_PROXY_TLS_ADDR", ":9443")
	t.Setenv("BINBOI_PUBLIC_SCHEME", "")
	t.Setenv("BINBOI_PUBLIC_PORT", "")

	cfg := LoadConfigFromEnv()

	if cfg.PublicScheme != "https" {
		t.Fatalf("PublicScheme = %q, want %q", cfg.PublicScheme, "https")
	}
	if cfg.PublicPort != 9443 {
		t.Fatalf("PublicPort = %d, want %d", cfg.PublicPort, 9443)
	}
}

func TestProxyHTTPHandlerRedirectsToConfiguredHTTPSURL(t *testing.T) {
	service := newTestService(t)
	service.cfg.ProxyTLSAddr = ":9443"
	service.cfg.PublicScheme = "https"
	service.cfg.PublicPort = 9443
	service.cfg.ACMECacheDir = t.TempDir()
	service.configureTLSManager()

	req := httptest.NewRequest(http.MethodGet, "http://demo.binboi.localhost:8000/health?full=1", nil)
	req.Host = "demo.binboi.localhost:8000"
	rec := httptest.NewRecorder()

	service.ProxyHTTPHandler().ServeHTTP(rec, req)

	if rec.Code != http.StatusPermanentRedirect {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusPermanentRedirect)
	}
	if location := rec.Header().Get("Location"); location != "https://demo.binboi.localhost:9443/health?full=1" {
		t.Fatalf("redirect location = %q, want %q", location, "https://demo.binboi.localhost:9443/health?full=1")
	}
}

func TestForwardedProtoAndPortPreferTrustedHeaders(t *testing.T) {
	service := newTestService(t)
	service.cfg.PublicScheme = "http"
	service.cfg.PublicPort = 8000

	req := httptest.NewRequest(http.MethodGet, "http://demo.binboi.localhost/hooks", nil)
	req.Header.Set("X-Forwarded-Proto", "https")
	req.Header.Set("X-Forwarded-Port", "443")

	if proto := service.forwardedProtoForRequest(req); proto != "https" {
		t.Fatalf("forwarded proto = %q, want %q", proto, "https")
	}
	if port := service.forwardedPortForRequest(req, "https"); port != "443" {
		t.Fatalf("forwarded port = %q, want %q", port, "443")
	}
}

func TestForwardedProtoFallsBackToTLSListener(t *testing.T) {
	service := newTestService(t)
	service.cfg.ProxyTLSAddr = ":8443"
	service.cfg.PublicScheme = "https"
	service.cfg.PublicPort = 8443

	req := httptest.NewRequest(http.MethodGet, "https://demo.binboi.localhost/status", nil)
	req.Host = "demo.binboi.localhost"
	req.TLS = &tls.ConnectionState{}

	if proto := service.forwardedProtoForRequest(req); proto != "https" {
		t.Fatalf("forwarded proto = %q, want %q", proto, "https")
	}
	if port := service.forwardedPortForRequest(req, "https"); port != "8443" {
		t.Fatalf("forwarded port = %q, want %q", port, "8443")
	}
}

func TestExtractSubdomain(t *testing.T) {
	subdomain := extractSubdomain("demo.binboi.localhost:8000", "binboi.localhost")
	if subdomain != "demo" {
		t.Fatalf("expected demo, got %s", subdomain)
	}
}

func TestProtectedTunnelRoutesRequireTokenOrTrustedLocal(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	service.authProvider = stubAuthProvider{
		enabled: true,
		identity: &AuthIdentity{
			UserID:      "user_123",
			Email:       "dev@binboi.test",
			Plan:        "PRO",
			TokenPrefix: "binboi_pat_test",
			AuthMode:    "personal-access-token",
		},
	}

	router := gin.New()
	service.RegisterRoutes(router)

	unauthorized := httptest.NewRequest(http.MethodGet, "/api/tunnels", nil)
	unauthorized.RemoteAddr = "8.8.8.8:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, unauthorized)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("remote unauthenticated /api/tunnels = %d, want %d", recorder.Code, http.StatusUnauthorized)
	}

	authorized := httptest.NewRequest(http.MethodGet, "/api/tunnels", nil)
	authorized.RemoteAddr = "8.8.8.8:4040"
	authorized.Header.Set("Authorization", "Bearer binboi_pat_test_secret")
	recorder = httptest.NewRecorder()
	router.ServeHTTP(recorder, authorized)
	if recorder.Code != http.StatusOK {
		t.Fatalf("token-authenticated /api/tunnels = %d, want %d", recorder.Code, http.StatusOK)
	}

	localAdmin := httptest.NewRequest(http.MethodGet, "/api/tunnels", nil)
	localAdmin.RemoteAddr = "127.0.0.1:4040"
	recorder = httptest.NewRecorder()
	router.ServeHTTP(recorder, localAdmin)
	if recorder.Code != http.StatusOK {
		t.Fatalf("local /api/tunnels = %d, want %d", recorder.Code, http.StatusOK)
	}
}

func TestV1InstanceRouteReturnsEnvelope(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/instance", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("/api/v1/instance = %d, want %d", recorder.Code, http.StatusOK)
	}

	var payload struct {
		Data InstanceResponse `json:"data"`
		Meta APIMeta          `json:"meta"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode /api/v1/instance response: %v", err)
	}

	if payload.Data.ManagedDomain != "binboi.localhost" {
		t.Fatalf("managed domain = %q, want %q", payload.Data.ManagedDomain, "binboi.localhost")
	}
	if payload.Meta.InstanceName == "" {
		t.Fatal("expected meta.instance_name to be populated")
	}
}

func TestHealthRouteSetsRequestIDHeader(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("/api/health = %d, want %d", recorder.Code, http.StatusOK)
	}
	if recorder.Header().Get(requestIDHeader) == "" {
		t.Fatal("expected X-Request-ID header to be populated")
	}
}

func TestReadyRouteReturnsDetailedChecks(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	now := time.Now().UTC()
	service.recordDomainVerifierRun(nil)
	service.workerMu.Lock()
	service.domainVerifierState.LastRunAt = &now
	service.domainVerifierState.LastSuccessAt = &now
	service.workerMu.Unlock()

	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/ready", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("/api/ready = %d, want %d", recorder.Code, http.StatusOK)
	}

	var payload ReadinessResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode /api/ready response: %v", err)
	}

	if !payload.Ready {
		t.Fatal("expected ready response to be true")
	}
	if payload.Checks["sqlite"].Status != "ok" {
		t.Fatalf("sqlite status = %q, want ok", payload.Checks["sqlite"].Status)
	}
	if payload.Checks["domain_verifier"].Status != "ok" {
		t.Fatalf("domain verifier status = %q, want ok", payload.Checks["domain_verifier"].Status)
	}
	if payload.Checks["tls"].Status != "external" {
		t.Fatalf("tls status = %q, want external", payload.Checks["tls"].Status)
	}
}

func TestV1ReadyRouteReturnsServiceUnavailableWhenAuthHealthFails(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	service.authProvider = stubAuthProvider{
		enabled:   true,
		healthErr: errors.New("postgres unreachable"),
	}

	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/ready", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("/api/v1/ready = %d, want %d", recorder.Code, http.StatusServiceUnavailable)
	}

	var payload struct {
		Data ReadinessResponse `json:"data"`
		Meta APIMeta           `json:"meta"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode /api/v1/ready response: %v", err)
	}

	if payload.Data.Ready {
		t.Fatal("expected ready response to be false")
	}
	if payload.Data.Checks["auth"].Status != "error" {
		t.Fatalf("auth status = %q, want error", payload.Data.Checks["auth"].Status)
	}
}

func TestV1LimitsRouteReturnsQuotaEnvelope(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	if err := service.db.Create(&TunnelRecord{
		ID:         "quota_tunnel",
		Subdomain:  "quota",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
	}).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/limits", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("/api/v1/limits = %d, want %d", recorder.Code, http.StatusOK)
	}

	var payload struct {
		Data QuotaSnapshot `json:"data"`
		Meta APIMeta       `json:"meta"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode /api/v1/limits response: %v", err)
	}

	if payload.Data.Plan != "PREVIEW" {
		t.Fatalf("plan = %q, want PREVIEW", payload.Data.Plan)
	}
	if payload.Data.ReservedTunnels.Used != 1 {
		t.Fatalf("reserved tunnels used = %d, want 1", payload.Data.ReservedTunnels.Used)
	}
	if payload.Data.ActiveTunnels.Used != 1 {
		t.Fatalf("active tunnels used = %d, want 1", payload.Data.ActiveTunnels.Used)
	}
	if payload.Data.ReplaysPerHour.Used != 0 {
		t.Fatalf("replays per hour used = %d, want 0", payload.Data.ReplaysPerHour.Used)
	}
	if recorder.Header().Get("X-Binboi-Plan") != "PREVIEW" {
		t.Fatalf("X-Binboi-Plan = %q, want PREVIEW", recorder.Header().Get("X-Binboi-Plan"))
	}
}

func TestV1OperatorSnapshotRouteReturnsEnvelope(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	now := time.Now().UTC()
	service.recordDomainVerifierRun(nil)
	service.workerMu.Lock()
	service.domainVerifierState.LastRunAt = &now
	service.domainVerifierState.LastSuccessAt = &now
	service.workerMu.Unlock()

	if err := service.db.Create(&TunnelRecord{
		ID:         "snapshot_tunnel",
		Subdomain:  "snapshot",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
	}).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/snapshot", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("/api/v1/snapshot = %d, want %d", recorder.Code, http.StatusOK)
	}

	var payload struct {
		Data OperatorSnapshotResponse `json:"data"`
		Meta APIMeta                  `json:"meta"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode /api/v1/snapshot response: %v", err)
	}

	if payload.Data.Health.Status != "ok" {
		t.Fatalf("health status = %q, want ok", payload.Data.Health.Status)
	}
	if !payload.Data.Readiness.Ready {
		t.Fatal("expected readiness.ready to be true")
	}
	if payload.Data.Metrics.InstanceName == "" {
		t.Fatal("expected metrics.instance_name to be populated")
	}
	if payload.Data.Limits.Plan != "PREVIEW" {
		t.Fatalf("limits.plan = %q, want PREVIEW", payload.Data.Limits.Plan)
	}
	if payload.Data.Instance.ManagedDomain != "binboi.localhost" {
		t.Fatalf("instance.managed_domain = %q, want %q", payload.Data.Instance.ManagedDomain, "binboi.localhost")
	}
	if payload.Meta.AccessScope != "trusted-local" {
		t.Fatalf("meta.access_scope = %q, want %q", payload.Meta.AccessScope, "trusted-local")
	}
}

func TestV1OperatorSnapshotRouteReturnsServiceUnavailableWhenReadinessFails(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	service.authProvider = stubAuthProvider{
		enabled:   true,
		healthErr: errors.New("postgres unreachable"),
	}

	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/snapshot", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("/api/v1/snapshot = %d, want %d", recorder.Code, http.StatusServiceUnavailable)
	}

	var payload struct {
		Data OperatorSnapshotResponse `json:"data"`
		Meta APIMeta                  `json:"meta"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode /api/v1/snapshot response: %v", err)
	}

	if payload.Data.Status != "error" {
		t.Fatalf("snapshot status = %q, want error", payload.Data.Status)
	}
	if payload.Data.Readiness.Checks["auth"].Status != "error" {
		t.Fatalf("auth readiness status = %q, want error", payload.Data.Readiness.Checks["auth"].Status)
	}
}

func TestV1OperatorSnapshotRouteIncludesRecentCriticalEventsAndTunnelSummary(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	now := time.Now().UTC()
	older := now.Add(-2 * time.Minute)

	tunnels := []TunnelRecord{
		{
			ID:               "snapshot-active",
			Subdomain:        "alpha",
			Target:           "http://localhost:3000",
			Status:           "ACTIVE",
			Region:           "local",
			RequestCount:     12,
			BytesTransferred: 4096,
			LastConnectedAt:  &now,
			CreatedAt:        older,
			UpdatedAt:        now,
		},
		{
			ID:                 "snapshot-error",
			Subdomain:          "beta",
			Target:             "http://localhost:4000",
			Status:             "ERROR",
			Region:             "local",
			LastError:          "proxy stream failed",
			LastDisconnectedAt: &older,
			CreatedAt:          older,
			UpdatedAt:          older,
		},
	}
	for _, tunnel := range tunnels {
		if err := service.db.Create(&tunnel).Error; err != nil {
			t.Fatalf("insert tunnel %s: %v", tunnel.Subdomain, err)
		}
	}

	events := []EventRecord{
		{Level: "info", Message: "noise", TunnelSubdomain: "alpha", CreatedAt: older.Add(-time.Minute)},
		{Level: "warn", Message: "quota pressure", TunnelSubdomain: "beta", CreatedAt: older},
		{Level: "error", Message: "tunnel broke", TunnelSubdomain: "alpha", CreatedAt: now},
	}
	for _, event := range events {
		if err := service.db.Create(&event).Error; err != nil {
			t.Fatalf("insert event %q: %v", event.Message, err)
		}
	}

	service.mu.Lock()
	service.sessions["alpha"] = &activeSession{connectedAt: now}
	service.mu.Unlock()

	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/snapshot", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("/api/v1/snapshot = %d, want %d", recorder.Code, http.StatusOK)
	}

	var payload struct {
		Data OperatorSnapshotResponse `json:"data"`
		Meta APIMeta                  `json:"meta"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode /api/v1/snapshot response: %v", err)
	}

	if len(payload.Data.RecentCriticalEvents) != 2 {
		t.Fatalf("recent_critical_events len = %d, want 2", len(payload.Data.RecentCriticalEvents))
	}
	if payload.Data.RecentCriticalEvents[0].Level != "error" {
		t.Fatalf("first critical event level = %q, want error", payload.Data.RecentCriticalEvents[0].Level)
	}
	if payload.Data.RecentCriticalEvents[1].Level != "warn" {
		t.Fatalf("second critical event level = %q, want warn", payload.Data.RecentCriticalEvents[1].Level)
	}
	if payload.Data.TunnelSummary.StatusCounts.Active != 1 {
		t.Fatalf("active tunnel count = %d, want 1", payload.Data.TunnelSummary.StatusCounts.Active)
	}
	if payload.Data.TunnelSummary.StatusCounts.Error != 1 {
		t.Fatalf("error tunnel count = %d, want 1", payload.Data.TunnelSummary.StatusCounts.Error)
	}
	if len(payload.Data.TunnelSummary.Recent) != 2 {
		t.Fatalf("recent tunnels len = %d, want 2", len(payload.Data.TunnelSummary.Recent))
	}
	if payload.Data.TunnelSummary.Recent[0].Subdomain != "alpha" {
		t.Fatalf("most recent tunnel = %q, want alpha", payload.Data.TunnelSummary.Recent[0].Subdomain)
	}
	if !payload.Data.TunnelSummary.Recent[0].ActiveSession {
		t.Fatal("expected alpha tunnel to be marked active_session")
	}
	if payload.Data.TunnelSummary.Recent[1].LastError != "proxy stream failed" {
		t.Fatalf("beta last_error = %q, want %q", payload.Data.TunnelSummary.Recent[1].LastError, "proxy stream failed")
	}
}

func TestTunnelListIncludesQuotaHeaders(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/tunnels", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("/api/tunnels = %d, want %d", recorder.Code, http.StatusOK)
	}
	if recorder.Header().Get("X-Binboi-Quota-Scope") != "trusted-local" {
		t.Fatalf("X-Binboi-Quota-Scope = %q, want trusted-local", recorder.Header().Get("X-Binboi-Quota-Scope"))
	}
	if recorder.Header().Get("X-Binboi-Quota-Reserved-Tunnels-Limit") == "" {
		t.Fatal("expected reserved tunnel quota header to be populated")
	}
	if recorder.Header().Get("X-Binboi-Quota-Replays-Per-Hour-Limit") == "" {
		t.Fatal("expected replay quota header to be populated")
	}
}

func TestAPIRateLimitRejectsBurstAndTrustedLocalBypasses(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	service.cfg.APIRateLimit = 1
	service.cfg.APIRateBurst = 1
	service.configureRuntimeGuards()

	router := gin.New()
	service.RegisterRoutes(router)

	first := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	first.RemoteAddr = "8.8.8.8:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, first)
	if recorder.Code != http.StatusOK {
		t.Fatalf("first remote /api/health = %d, want %d", recorder.Code, http.StatusOK)
	}

	second := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	second.RemoteAddr = "8.8.8.8:4040"
	recorder = httptest.NewRecorder()
	router.ServeHTTP(recorder, second)
	if recorder.Code != http.StatusTooManyRequests {
		t.Fatalf("second remote /api/health = %d, want %d", recorder.Code, http.StatusTooManyRequests)
	}
	if recorder.Header().Get("Retry-After") == "" {
		t.Fatal("expected Retry-After header when API rate limit trips")
	}

	local := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	local.RemoteAddr = "127.0.0.1:4040"
	recorder = httptest.NewRecorder()
	router.ServeHTTP(recorder, local)
	if recorder.Code != http.StatusOK {
		t.Fatalf("trusted local /api/health = %d, want %d", recorder.Code, http.StatusOK)
	}
}

func TestProxyRateLimitRejectsBurst(t *testing.T) {
	service := newTestService(t)
	service.cfg.ProxyRateLimit = 1
	service.cfg.ProxyRateBurst = 1
	service.configureRuntimeGuards()

	handler := service.ServeProxy()

	first := httptest.NewRequest(http.MethodGet, "http://binboi.localhost:8000/", nil)
	first.Host = "binboi.localhost:8000"
	first.RemoteAddr = "7.7.7.7:5050"
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, first)
	if recorder.Code != http.StatusOK {
		t.Fatalf("first proxy request = %d, want %d", recorder.Code, http.StatusOK)
	}

	second := httptest.NewRequest(http.MethodGet, "http://binboi.localhost:8000/", nil)
	second.Host = "binboi.localhost:8000"
	second.RemoteAddr = "7.7.7.7:5050"
	recorder = httptest.NewRecorder()
	handler.ServeHTTP(recorder, second)
	if recorder.Code != http.StatusTooManyRequests {
		t.Fatalf("second proxy request = %d, want %d", recorder.Code, http.StatusTooManyRequests)
	}
	if recorder.Header().Get("Retry-After") == "" {
		t.Fatal("expected Retry-After header when proxy rate limit trips")
	}
}

func TestV1MetricsRouteReturnsEnvelope(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	service.recordAPIRequest(http.StatusOK)
	service.recordAPIRequest(http.StatusInternalServerError)
	service.recordProxyRequest(http.StatusBadGateway)
	service.recordTunnelConnectionAccepted()
	service.recordTunnelConnectionRejected()

	if _, err := service.createDomain("docs.example.com", requestAccess{TrustedLocal: true}); err != nil {
		t.Fatalf("createDomain returned error: %v", err)
	}
	if err := service.db.Create(&TunnelRecord{
		ID:         "metrics_tunnel",
		Subdomain:  "metrics",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
	}).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/metrics", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("/api/v1/metrics = %d, want %d", recorder.Code, http.StatusOK)
	}

	var payload struct {
		Data MetricsSnapshot `json:"data"`
		Meta APIMeta         `json:"meta"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode /api/v1/metrics response: %v", err)
	}

	if payload.Data.APIRequestsTotal != 2 {
		t.Fatalf("api_requests_total = %d, want 2", payload.Data.APIRequestsTotal)
	}
	if payload.Data.APIRequestErrorsTotal != 1 {
		t.Fatalf("api_request_errors_total = %d, want 1", payload.Data.APIRequestErrorsTotal)
	}
	if payload.Data.APIRateLimitedTotal != 0 {
		t.Fatalf("api_rate_limited_total = %d, want 0", payload.Data.APIRateLimitedTotal)
	}
	if payload.Data.ProxyRequestsTotal != 1 {
		t.Fatalf("proxy_requests_total = %d, want 1", payload.Data.ProxyRequestsTotal)
	}
	if payload.Data.ProxyRateLimitedTotal != 0 {
		t.Fatalf("proxy_rate_limited_total = %d, want 0", payload.Data.ProxyRateLimitedTotal)
	}
	if payload.Data.RequestReplaysTotal != 0 {
		t.Fatalf("request_replays_total = %d, want 0", payload.Data.RequestReplaysTotal)
	}
	if payload.Data.RequestReplayFailedTotal != 0 {
		t.Fatalf("request_replay_failed_total = %d, want 0", payload.Data.RequestReplayFailedTotal)
	}
	if payload.Data.RequestReplayBlockedTotal != 0 {
		t.Fatalf("request_replay_blocked_total = %d, want 0", payload.Data.RequestReplayBlockedTotal)
	}
	if payload.Data.TunnelConnectionsTotal != 1 {
		t.Fatalf("tunnel_connections_total = %d, want 1", payload.Data.TunnelConnectionsTotal)
	}
	if payload.Data.TunnelRejectionsTotal != 1 {
		t.Fatalf("tunnel_rejections_total = %d, want 1", payload.Data.TunnelRejectionsTotal)
	}
	if payload.Data.ReservedTunnels < 1 {
		t.Fatalf("reserved_tunnels = %d, want at least 1", payload.Data.ReservedTunnels)
	}
	if payload.Data.DomainsTotal < 2 {
		t.Fatalf("domains_total = %d, want at least 2", payload.Data.DomainsTotal)
	}
	if payload.Data.PendingDomainsTotal < 1 {
		t.Fatalf("pending_domains_total = %d, want at least 1", payload.Data.PendingDomainsTotal)
	}
	if payload.Meta.AccessScope != "trusted-local" {
		t.Fatalf("access scope = %q, want %q", payload.Meta.AccessScope, "trusted-local")
	}
}

func TestV1TunnelListReturnsEnvelopeAndHonorsScope(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	service.authProvider = stubAuthProvider{
		enabled: true,
		identity: &AuthIdentity{
			UserID:      "user_123",
			Email:       "dev@binboi.test",
			Plan:        "PRO",
			TokenPrefix: "binboi_pat_test",
			AuthMode:    "personal-access-token",
		},
	}

	activeAt := time.Now().UTC()
	if err := service.db.Create(&TunnelRecord{
		ID:              "active_tunnel",
		Subdomain:       "alpha",
		OwnerUserID:     "user_123",
		OwnerEmail:      "dev@binboi.test",
		Target:          "http://localhost:3000",
		TargetPort:      3000,
		Status:          "ACTIVE",
		Region:          "local",
		LastConnectedAt: &activeAt,
	}).Error; err != nil {
		t.Fatalf("insert active tunnel: %v", err)
	}
	if err := service.db.Create(&TunnelRecord{
		ID:          "inactive_tunnel",
		Subdomain:   "beta",
		OwnerUserID: "user_123",
		OwnerEmail:  "dev@binboi.test",
		Target:      "http://localhost:4000",
		TargetPort:  4000,
		Status:      "INACTIVE",
		Region:      "local",
	}).Error; err != nil {
		t.Fatalf("insert inactive tunnel: %v", err)
	}

	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/tunnels?scope=active", nil)
	request.RemoteAddr = "8.8.8.8:4040"
	request.Header.Set("Authorization", "Bearer binboi_pat_test_secret")
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("/api/v1/tunnels?scope=active = %d, want %d", recorder.Code, http.StatusOK)
	}

	var payload struct {
		Data []TunnelResponse `json:"data"`
		Meta APIMeta          `json:"meta"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode /api/v1/tunnels response: %v", err)
	}

	if len(payload.Data) != 1 {
		t.Fatalf("active tunnel count = %d, want 1", len(payload.Data))
	}
	if payload.Data[0].Status != "ACTIVE" {
		t.Fatalf("tunnel status = %q, want ACTIVE", payload.Data[0].Status)
	}
	if payload.Meta.AccessScope != "token" {
		t.Fatalf("access scope = %q, want %q", payload.Meta.AccessScope, "token")
	}
}

func TestUpsertTunnelOnConnectRejectsAnotherOwner(t *testing.T) {
	service := newTestService(t)
	service.authProvider = stubAuthProvider{enabled: true}

	owner := &AuthIdentity{
		UserID:   "owner_1",
		Email:    "owner@binboi.test",
		AuthMode: "personal-access-token",
	}
	other := &AuthIdentity{
		UserID:   "owner_2",
		Email:    "other@binboi.test",
		AuthMode: "personal-access-token",
	}

	created, err := service.createTunnel("owner-app", "3000", "", requestAccess{Identity: owner})
	if err != nil {
		t.Fatalf("createTunnel returned error: %v", err)
	}
	if created.OwnerUserID != owner.UserID {
		t.Fatalf("createTunnel owner = %q, want %q", created.OwnerUserID, owner.UserID)
	}

	if err := service.upsertTunnelOnConnect("owner-app", 3000, other); err == nil {
		t.Fatal("upsertTunnelOnConnect() for another owner returned nil error")
	}

	if err := service.upsertTunnelOnConnect("owner-app", 3000, owner); err != nil {
		t.Fatalf("upsertTunnelOnConnect() for owner returned error: %v", err)
	}
}

func TestListRequestsFiltersByOwner(t *testing.T) {
	service := newTestService(t)
	service.authProvider = stubAuthProvider{enabled: true}

	now := time.Now().UTC()
	tunnelA := TunnelRecord{
		ID:          "tunnel_a",
		Subdomain:   "alpha",
		OwnerUserID: "user_a",
		OwnerEmail:  "a@binboi.test",
		Target:      "http://localhost:3000",
		TargetPort:  3000,
		Status:      "ACTIVE",
		Region:      "local",
		CreatedAt:   now,
	}
	tunnelB := TunnelRecord{
		ID:          "tunnel_b",
		Subdomain:   "beta",
		OwnerUserID: "user_b",
		OwnerEmail:  "b@binboi.test",
		Target:      "http://localhost:4000",
		TargetPort:  4000,
		Status:      "ACTIVE",
		Region:      "local",
		CreatedAt:   now,
	}
	if err := service.db.Create(&tunnelA).Error; err != nil {
		t.Fatalf("insert tunnelA: %v", err)
	}
	if err := service.db.Create(&tunnelB).Error; err != nil {
		t.Fatalf("insert tunnelB: %v", err)
	}

	if err := service.db.Create(&RequestRecord{
		ID:              "req_a",
		TunnelID:        tunnelA.ID,
		TunnelSubdomain: tunnelA.Subdomain,
		Method:          http.MethodPost,
		Path:            "/webhook",
		Status:          http.StatusBadRequest,
		CreatedAt:       now,
	}).Error; err != nil {
		t.Fatalf("insert requestA: %v", err)
	}
	if err := service.db.Create(&RequestRecord{
		ID:              "req_b",
		TunnelID:        tunnelB.ID,
		TunnelSubdomain: tunnelB.Subdomain,
		Method:          http.MethodGet,
		Path:            "/health",
		Status:          http.StatusOK,
		CreatedAt:       now.Add(time.Second),
	}).Error; err != nil {
		t.Fatalf("insert requestB: %v", err)
	}

	requests, err := service.listRequests(requestAccess{
		Identity: &AuthIdentity{UserID: "user_a"},
	}, requestListOptions{Limit: 20})
	if err != nil {
		t.Fatalf("listRequests returned error: %v", err)
	}
	if len(requests) != 1 {
		t.Fatalf("listRequests() len = %d, want 1", len(requests))
	}
	if requests[0].TunnelSubdomain != "alpha" {
		t.Fatalf("listRequests()[0].TunnelSubdomain = %q, want %q", requests[0].TunnelSubdomain, "alpha")
	}
}

func TestListRequestsHonorsKindFilter(t *testing.T) {
	service := newTestService(t)

	now := time.Now().UTC()
	tunnel := TunnelRecord{
		ID:         "tunnel_a",
		Subdomain:  "alpha",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
		CreatedAt:  now,
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	if err := service.db.Create(&RequestRecord{
		ID:              "req_standard",
		TunnelID:        tunnel.ID,
		TunnelSubdomain: tunnel.Subdomain,
		Kind:            "REQUEST",
		Method:          http.MethodGet,
		Path:            "/health",
		Status:          http.StatusOK,
		CreatedAt:       now,
	}).Error; err != nil {
		t.Fatalf("insert standard request: %v", err)
	}
	if err := service.db.Create(&RequestRecord{
		ID:              "req_webhook",
		TunnelID:        tunnel.ID,
		TunnelSubdomain: tunnel.Subdomain,
		Kind:            "WEBHOOK",
		Method:          http.MethodPost,
		Path:            "/api/webhooks/stripe",
		Status:          http.StatusAccepted,
		CreatedAt:       now.Add(time.Second),
	}).Error; err != nil {
		t.Fatalf("insert webhook request: %v", err)
	}

	requests, err := service.listRequests(requestAccess{TrustedLocal: true}, requestListOptions{
		Limit: 20,
		Kind:  "WEBHOOK",
	})
	if err != nil {
		t.Fatalf("listRequests with kind filter returned error: %v", err)
	}
	if len(requests) != 1 {
		t.Fatalf("listRequests(kind=WEBHOOK) len = %d, want 1", len(requests))
	}
	if requests[0].Kind != "WEBHOOK" {
		t.Fatalf("listRequests(kind=WEBHOOK)[0].Kind = %q, want %q", requests[0].Kind, "WEBHOOK")
	}
}

func TestListRequestsSupportsProviderStatusAndQueryFilters(t *testing.T) {
	service := newTestService(t)

	now := time.Now().UTC()
	tunnel := TunnelRecord{
		ID:         "tunnel_filter",
		Subdomain:  "filtered-app",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
		CreatedAt:  now,
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	records := []RequestRecord{
		{
			ID:              "req_stripe_fail",
			TunnelID:        tunnel.ID,
			TunnelSubdomain: tunnel.Subdomain,
			Kind:            "WEBHOOK",
			Provider:        "Stripe",
			EventType:       "payment_intent.created",
			DeliveryID:      "stripe-delivery-1",
			Method:          http.MethodPost,
			Path:            "/webhooks/stripe",
			Status:          http.StatusBadRequest,
			ErrorType:       "SIGNATURE_VERIFICATION_FAILED",
			RequestPreview:  "stripe webhook payload",
			CreatedAt:       now,
		},
		{
			ID:              "req_github_ok",
			TunnelID:        tunnel.ID,
			TunnelSubdomain: tunnel.Subdomain,
			Kind:            "WEBHOOK",
			Provider:        "GitHub",
			Method:          http.MethodPost,
			Path:            "/webhooks/github",
			Status:          http.StatusOK,
			RequestPreview:  "github webhook payload",
			CreatedAt:       now.Add(time.Second),
		},
	}
	for _, record := range records {
		if err := service.db.Create(&record).Error; err != nil {
			t.Fatalf("insert request %s: %v", record.ID, err)
		}
	}

	filtered, err := service.listRequests(requestAccess{TrustedLocal: true}, requestListOptions{
		Limit:       20,
		Provider:    "stripe",
		EventType:   "payment_intent.created",
		DeliveryID:  "stripe-delivery-1",
		StatusClass: "error",
		Query:       "signature",
	})
	if err != nil {
		t.Fatalf("listRequests with compound filters returned error: %v", err)
	}
	if len(filtered) != 1 {
		t.Fatalf("filtered request count = %d, want 1", len(filtered))
	}
	if filtered[0].Provider != "Stripe" {
		t.Fatalf("filtered provider = %q, want %q", filtered[0].Provider, "Stripe")
	}
	if filtered[0].EventType != "payment_intent.created" {
		t.Fatalf("filtered event_type = %q, want %q", filtered[0].EventType, "payment_intent.created")
	}
	if filtered[0].DeliveryID != "stripe-delivery-1" {
		t.Fatalf("filtered delivery_id = %q, want %q", filtered[0].DeliveryID, "stripe-delivery-1")
	}
}

func TestListRequestsSupportsTimeWindowFilters(t *testing.T) {
	service := newTestService(t)

	now := time.Now().UTC().Add(-2 * time.Hour)
	tunnel := TunnelRecord{
		ID:         "tunnel_time_filter",
		Subdomain:  "time-filter",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
		CreatedAt:  now,
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	records := []RequestRecord{
		{
			ID:              "req_old",
			TunnelID:        tunnel.ID,
			TunnelSubdomain: tunnel.Subdomain,
			Method:          http.MethodGet,
			Path:            "/old",
			Status:          http.StatusOK,
			CreatedAt:       now,
		},
		{
			ID:              "req_new",
			TunnelID:        tunnel.ID,
			TunnelSubdomain: tunnel.Subdomain,
			Method:          http.MethodGet,
			Path:            "/new",
			Status:          http.StatusOK,
			CreatedAt:       now.Add(90 * time.Minute),
		},
	}
	for _, record := range records {
		if err := service.db.Create(&record).Error; err != nil {
			t.Fatalf("insert request %s: %v", record.ID, err)
		}
	}

	since := now.Add(time.Hour)
	filtered, err := service.listRequests(requestAccess{TrustedLocal: true}, requestListOptions{
		Limit: 20,
		Since: &since,
	})
	if err != nil {
		t.Fatalf("listRequests with since filter returned error: %v", err)
	}
	if len(filtered) != 1 {
		t.Fatalf("filtered request count = %d, want 1", len(filtered))
	}
	if filtered[0].ID != "req_new" {
		t.Fatalf("filtered request id = %q, want %q", filtered[0].ID, "req_new")
	}
}

func TestListRequestsSupportsMethodPathPrefixAndAscendingSort(t *testing.T) {
	service := newTestService(t)

	now := time.Now().UTC().Add(-time.Hour)
	tunnel := TunnelRecord{
		ID:         "tunnel_method_filter",
		Subdomain:  "method-filter",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
		CreatedAt:  now,
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	records := []RequestRecord{
		{
			ID:              "req_post_older",
			TunnelID:        tunnel.ID,
			TunnelSubdomain: tunnel.Subdomain,
			Method:          http.MethodPost,
			Path:            "/webhooks/stripe",
			Status:          http.StatusAccepted,
			CreatedAt:       now,
		},
		{
			ID:              "req_get_skip",
			TunnelID:        tunnel.ID,
			TunnelSubdomain: tunnel.Subdomain,
			Method:          http.MethodGet,
			Path:            "/webhooks/stripe",
			Status:          http.StatusOK,
			CreatedAt:       now.Add(5 * time.Minute),
		},
		{
			ID:              "req_post_newer",
			TunnelID:        tunnel.ID,
			TunnelSubdomain: tunnel.Subdomain,
			Method:          http.MethodPost,
			Path:            "/webhooks/stripe/retry",
			Status:          http.StatusAccepted,
			CreatedAt:       now.Add(10 * time.Minute),
		},
	}
	for _, record := range records {
		if err := service.db.Create(&record).Error; err != nil {
			t.Fatalf("insert request %s: %v", record.ID, err)
		}
	}

	filtered, err := service.listRequests(requestAccess{TrustedLocal: true}, requestListOptions{
		Limit:      20,
		Method:     "POST",
		PathPrefix: "/webhooks/stripe",
		Sort:       "asc",
	})
	if err != nil {
		t.Fatalf("listRequests with method/path_prefix/sort returned error: %v", err)
	}
	if len(filtered) != 2 {
		t.Fatalf("filtered request count = %d, want 2", len(filtered))
	}
	if filtered[0].ID != "req_post_older" {
		t.Fatalf("first filtered request id = %q, want %q", filtered[0].ID, "req_post_older")
	}
	if filtered[1].ID != "req_post_newer" {
		t.Fatalf("second filtered request id = %q, want %q", filtered[1].ID, "req_post_newer")
	}
}

func TestCaptureRequestSnapshotInfersWebhookMetadata(t *testing.T) {
	service := newTestService(t)

	request := httptest.NewRequest(http.MethodPost, "https://alpha.binboi.localhost/webhooks/github", strings.NewReader(`{"id":"evt_123","action":"opened"}`))
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("User-Agent", "GitHub-Hookshot/test")
	request.Header.Set("X-GitHub-Delivery", "gh-delivery-1")
	request.Header.Set("X-GitHub-Event", "issues")
	request.Header.Set("X-Hub-Signature-256", "sha256=abc")

	snapshot := service.captureRequestSnapshot(request)
	if snapshot.Provider != "GitHub" {
		t.Fatalf("provider = %q, want %q", snapshot.Provider, "GitHub")
	}
	if snapshot.EventType != "issues" {
		t.Fatalf("event type = %q, want %q", snapshot.EventType, "issues")
	}
	if snapshot.DeliveryID != "gh-delivery-1" {
		t.Fatalf("delivery id = %q, want %q", snapshot.DeliveryID, "gh-delivery-1")
	}
	metadata := unmarshalRequestMetadata(snapshot.MetadataJSON)
	if metadata["delivery_id"] != "gh-delivery-1" {
		t.Fatalf("metadata delivery_id = %v, want %q", metadata["delivery_id"], "gh-delivery-1")
	}
	if metadata["event_type"] != "issues" {
		t.Fatalf("metadata event_type = %v, want %q", metadata["event_type"], "issues")
	}
	if metadata["signature_present"] != true {
		t.Fatalf("metadata signature_present = %v, want true", metadata["signature_present"])
	}
}

func TestListEventsSupportsLevelTunnelAndQueryFilters(t *testing.T) {
	service := newTestService(t)

	now := time.Now().UTC()
	events := []EventRecord{
		{Level: "info", Message: "Tunnel alpha connected", TunnelSubdomain: "alpha", Action: "tunnel.connect", ResourceType: "tunnel", ResourceID: "alpha", RequestID: "req-alpha", CreatedAt: now},
		{Level: "error", Message: "Proxy error for beta", TunnelSubdomain: "beta", Action: "request.replay.failed", ResourceType: "request", ResourceID: "req_beta", RequestID: "req-beta", CreatedAt: now.Add(time.Second)},
	}
	for _, record := range events {
		if err := service.db.Create(&record).Error; err != nil {
			t.Fatalf("insert event: %v", err)
		}
	}

	filtered, err := service.listEvents(requestAccess{TrustedLocal: true}, eventListOptions{
		Limit:        20,
		Level:        "error",
		Tunnel:       "beta",
		ResourceType: "request",
		ResourceID:   "req_beta",
		RequestID:    "req-beta",
		Query:        "proxy",
	})
	if err != nil {
		t.Fatalf("listEvents with filters returned error: %v", err)
	}
	if len(filtered) != 1 {
		t.Fatalf("filtered event count = %d, want 1", len(filtered))
	}
	if filtered[0].TunnelSubdomain != "beta" {
		t.Fatalf("filtered tunnel = %q, want %q", filtered[0].TunnelSubdomain, "beta")
	}
	if filtered[0].ResourceID != "req_beta" {
		t.Fatalf("filtered resource_id = %q, want %q", filtered[0].ResourceID, "req_beta")
	}
}

func TestListEventsSupportsTimeWindowFilters(t *testing.T) {
	service := newTestService(t)

	now := time.Now().UTC().Add(-2 * time.Hour)
	events := []EventRecord{
		{
			Level:     "info",
			Message:   "Older event",
			Action:    "request.replay",
			CreatedAt: now,
		},
		{
			Level:     "info",
			Message:   "Newer event",
			Action:    "request.replay",
			CreatedAt: now.Add(90 * time.Minute),
		},
	}
	for _, record := range events {
		if err := service.db.Create(&record).Error; err != nil {
			t.Fatalf("insert event: %v", err)
		}
	}

	since := now.Add(time.Hour)
	filtered, err := service.listEvents(requestAccess{TrustedLocal: true}, eventListOptions{
		Limit: 20,
		Since: &since,
	})
	if err != nil {
		t.Fatalf("listEvents with since filter returned error: %v", err)
	}
	if len(filtered) != 1 {
		t.Fatalf("filtered event count = %d, want 1", len(filtered))
	}
	if filtered[0].Message != "Newer event" {
		t.Fatalf("filtered event message = %q, want %q", filtered[0].Message, "Newer event")
	}
}

func TestListEventsSupportsAccessScopeAndAscendingSort(t *testing.T) {
	service := newTestService(t)

	now := time.Now().UTC().Add(-time.Hour)
	events := []EventRecord{
		{
			Level:       "info",
			Message:     "First trusted-local event",
			Action:      "request.replay",
			AccessScope: "trusted-local",
			CreatedAt:   now,
		},
		{
			Level:       "info",
			Message:     "Token event",
			Action:      "request.replay",
			AccessScope: "personal-access-token",
			CreatedAt:   now.Add(5 * time.Minute),
		},
		{
			Level:       "info",
			Message:     "Second trusted-local event",
			Action:      "request.replay",
			AccessScope: "trusted-local",
			CreatedAt:   now.Add(10 * time.Minute),
		},
	}
	for _, record := range events {
		if err := service.db.Create(&record).Error; err != nil {
			t.Fatalf("insert event: %v", err)
		}
	}

	filtered, err := service.listEvents(requestAccess{TrustedLocal: true}, eventListOptions{
		Limit:       20,
		AccessScope: "trusted-local",
		Sort:        "asc",
	})
	if err != nil {
		t.Fatalf("listEvents with access_scope/sort returned error: %v", err)
	}
	if len(filtered) != 2 {
		t.Fatalf("filtered event count = %d, want 2", len(filtered))
	}
	if filtered[0].Message != "First trusted-local event" {
		t.Fatalf("first filtered event message = %q, want %q", filtered[0].Message, "First trusted-local event")
	}
	if filtered[1].Message != "Second trusted-local event" {
		t.Fatalf("second filtered event message = %q, want %q", filtered[1].Message, "Second trusted-local event")
	}
}

func TestDeleteDomainProtectsManagedBaseDomain(t *testing.T) {
	service := newTestService(t)

	if _, err := service.createDomain(service.cfg.BaseDomain, requestAccess{TrustedLocal: true}); err == nil {
		t.Fatal("createDomain with managed base domain returned nil error")
	}

	if _, err := service.deleteDomain(service.cfg.BaseDomain, requestAccess{TrustedLocal: true}); err == nil {
		t.Fatal("deleteDomain on managed base domain returned nil error")
	}
}

func TestAllowACMEHostAllowsManagedAndVerifiedCustomDomains(t *testing.T) {
	service := newTestService(t)
	service.cfg.ProxyTLSAddr = ":8443"
	service.cfg.ACMECacheDir = t.TempDir()
	service.configureTLSManager()

	record, err := service.createDomain("docs.example.com", requestAccess{TrustedLocal: true})
	if err != nil {
		t.Fatalf("createDomain returned error: %v", err)
	}
	now := time.Now().UTC()
	record.Status = "VERIFIED"
	record.VerifiedAt = &now
	record.ExpectedTXT = ""
	if err := service.db.Save(&record).Error; err != nil {
		t.Fatalf("save domain: %v", err)
	}

	if err := service.allowACMEHost(context.Background(), "demo.binboi.localhost"); err != nil {
		t.Fatalf("allowACMEHost for managed subdomain returned error: %v", err)
	}
	if err := service.allowACMEHost(context.Background(), "docs.example.com"); err != nil {
		t.Fatalf("allowACMEHost for verified custom domain returned error: %v", err)
	}
	if err := service.allowACMEHost(context.Background(), "evil.example.com"); err == nil {
		t.Fatal("allowACMEHost for unknown custom domain returned nil error")
	}
}

func TestCreateTunnelRespectsFreePlanLimit(t *testing.T) {
	service := newTestService(t)
	service.authProvider = stubAuthProvider{enabled: true}

	access := requestAccess{
		Identity: &AuthIdentity{
			UserID:   "user_free",
			Email:    "free@binboi.test",
			Plan:     "FREE",
			AuthMode: "personal-access-token",
		},
	}

	if _, err := service.createTunnel("alpha", "3000", "", access); err != nil {
		t.Fatalf("first createTunnel returned error: %v", err)
	}
	if _, err := service.createTunnel("beta", "3001", "", access); err == nil {
		t.Fatal("second createTunnel returned nil error")
	} else if !isQuotaError(err) {
		t.Fatalf("second createTunnel error = %v, want quota error", err)
	}
}

func TestCreateDomainRequiresPaidPlan(t *testing.T) {
	service := newTestService(t)
	service.authProvider = stubAuthProvider{enabled: true}

	_, err := service.createDomain("docs.example.com", requestAccess{
		Identity: &AuthIdentity{
			UserID:   "user_free",
			Email:    "free@binboi.test",
			Plan:     "FREE",
			AuthMode: "personal-access-token",
		},
	})
	if err == nil {
		t.Fatal("createDomain returned nil error for free plan")
	}
	if !isQuotaError(err) {
		t.Fatalf("createDomain error = %v, want quota error", err)
	}
}

func TestEnforceRequestQuotaRejectsFreePlanOverDailyCap(t *testing.T) {
	service := newTestService(t)
	service.authProvider = stubAuthProvider{
		enabled: true,
		identity: &AuthIdentity{
			UserID: "user_free",
			Plan:   "FREE",
		},
	}

	tunnel := TunnelRecord{
		ID:          "tun_free",
		Subdomain:   "alpha",
		OwnerUserID: "user_free",
		OwnerEmail:  "free@binboi.test",
		AuthMode:    "personal-access-token",
		Target:      "http://localhost:3000",
		Status:      "ACTIVE",
		Region:      "local",
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	for i := 0; i < 100; i++ {
		if err := service.db.Create(&RequestRecord{
			ID:              fmt.Sprintf("req_%03d", i),
			TunnelID:        tunnel.ID,
			TunnelSubdomain: tunnel.Subdomain,
			Kind:            "REQUEST",
			Method:          http.MethodGet,
			Path:            "/",
			Status:          http.StatusOK,
			CreatedAt:       time.Now().UTC(),
		}).Error; err != nil {
			t.Fatalf("insert request %d: %v", i, err)
		}
	}

	if err := service.enforceRequestQuota(tunnel); err == nil {
		t.Fatal("enforceRequestQuota returned nil error")
	} else if !isQuotaError(err) {
		t.Fatalf("enforceRequestQuota error = %v, want quota error", err)
	}
}

func TestEnforceReplayQuotaRejectsFreePlanOverHourlyCap(t *testing.T) {
	service := newTestService(t)
	service.authProvider = stubAuthProvider{enabled: true}

	access := requestAccess{
		Identity: &AuthIdentity{
			UserID:   "user_free",
			Email:    "free@binboi.test",
			Plan:     "FREE",
			AuthMode: "personal-access-token",
		},
	}

	tunnel := TunnelRecord{
		ID:          "tun_replay_quota",
		Subdomain:   "quota-replay",
		OwnerUserID: "user_free",
		OwnerEmail:  "free@binboi.test",
		AuthMode:    "personal-access-token",
		Target:      "http://localhost:3000",
		Status:      "ACTIVE",
		Region:      "local",
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	for i := 0; i < quotaForPlan("FREE").MaxReplaysPerHour; i++ {
		if err := service.db.Create(&RequestRecord{
			ID:                fmt.Sprintf("req_replay_%03d", i),
			TunnelID:          tunnel.ID,
			TunnelSubdomain:   tunnel.Subdomain,
			ReplayOfRequestID: "req_original",
			Kind:              "WEBHOOK",
			Method:            http.MethodPost,
			Path:              "/hooks/github",
			Status:            http.StatusOK,
			CreatedAt:         time.Now().UTC(),
		}).Error; err != nil {
			t.Fatalf("insert replay %d: %v", i, err)
		}
	}

	if err := service.enforceReplayQuota(context.Background(), access); err == nil {
		t.Fatal("enforceReplayQuota returned nil error")
	} else if !isQuotaError(err) {
		t.Fatalf("enforceReplayQuota error = %v, want quota error", err)
	}
}

func TestHandleExportEventsReturnsNDJSON(t *testing.T) {
	service := newTestService(t)
	if err := service.db.Create(&EventRecord{
		Level:        "info",
		Message:      "Registered custom domain docs.example.com",
		Action:       "domain.create",
		ResourceType: "domain",
		ResourceID:   "docs.example.com",
		RequestID:    "req-domain-create",
		OwnerEmail:   "owner@binboi.test",
		AccessScope:  "trusted-local",
	}).Error; err != nil {
		t.Fatalf("insert event: %v", err)
	}

	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/events/export?format=ndjson&limit=10&resource_type=domain&request_id=req-domain-create", nil)
	ctx.Set("binboi.request_access", requestAccess{TrustedLocal: true})
	ctx.Set("binboi.request_id", "req-domain-create")

	service.handleExportEvents(ctx)

	if recorder.Code != http.StatusOK {
		t.Fatalf("export status = %d, want %d", recorder.Code, http.StatusOK)
	}
	if contentType := recorder.Header().Get("Content-Type"); !strings.Contains(contentType, "application/x-ndjson") {
		t.Fatalf("content type = %q, want ndjson", contentType)
	}
	if body := recorder.Body.String(); !strings.Contains(body, "\"action\":\"domain.create\"") {
		t.Fatalf("export body = %q, want action payload", body)
	}
	if body := recorder.Body.String(); !strings.Contains(body, "\"request_id\":\"req-domain-create\"") {
		t.Fatalf("export body = %q, want request_id payload", body)
	}
}

func TestHandleExportEventsSupportsGzip(t *testing.T) {
	service := newTestService(t)
	if err := service.db.Create(&EventRecord{
		Level:       "info",
		Message:     "Domain verified",
		Action:      "domain.verify",
		ResourceID:  "docs.example.com",
		AccessScope: "trusted-local",
	}).Error; err != nil {
		t.Fatalf("insert event: %v", err)
	}

	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/events/export?format=json", nil)
	ctx.Request.Header.Set("Accept-Encoding", "gzip")
	ctx.Set("binboi.request_access", requestAccess{TrustedLocal: true})

	service.handleExportEvents(ctx)

	if recorder.Code != http.StatusOK {
		t.Fatalf("export status = %d, want %d", recorder.Code, http.StatusOK)
	}
	if recorder.Header().Get("Content-Encoding") != "gzip" {
		t.Fatalf("content encoding = %q, want gzip", recorder.Header().Get("Content-Encoding"))
	}
	body := decodeGzipTestBody(t, recorder.Body.Bytes())
	if !strings.Contains(body, "\"action\":\"domain.verify\"") {
		t.Fatalf("gzip export body = %q, want domain.verify payload", body)
	}
}

func TestHandleExportEventsSupportsSummaryJSON(t *testing.T) {
	service := newTestService(t)
	if err := service.db.Create(&EventRecord{
		Level:        "info",
		Message:      "Reserved tunnel alpha",
		Action:       "tunnel.create",
		ResourceType: "tunnel",
		ResourceID:   "tun_alpha",
		RequestID:    "req-alpha",
		AccessScope:  "trusted-local",
		DetailsJSON:  `{"target":"http://localhost:3000"}`,
	}).Error; err != nil {
		t.Fatalf("insert event: %v", err)
	}

	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodGet, "/api/events/export?format=json&summary=true", nil)
	ctx.Set("binboi.request_access", requestAccess{TrustedLocal: true})

	service.handleExportEvents(ctx)

	if recorder.Code != http.StatusOK {
		t.Fatalf("export status = %d, want %d", recorder.Code, http.StatusOK)
	}

	var payload []map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode event summary export: %v", err)
	}
	if len(payload) != 1 {
		t.Fatalf("summary event count = %d, want 1", len(payload))
	}
	if payload[0]["action"] != "tunnel.create" {
		t.Fatalf("summary action = %v, want %q", payload[0]["action"], "tunnel.create")
	}
	if _, ok := payload[0]["details"]; ok {
		t.Fatalf("summary payload unexpectedly included details: %#v", payload[0]["details"])
	}
}

func TestV1ListRequestsRejectsInvalidTimeFilter(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/requests?since=not-a-timestamp", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("/api/v1/requests invalid since = %d, want %d", recorder.Code, http.StatusBadRequest)
	}
	if !strings.Contains(recorder.Body.String(), "INVALID_TIME_FILTER") {
		t.Fatalf("response body = %q, want INVALID_TIME_FILTER", recorder.Body.String())
	}
}

func TestDomainResponseIncludesTLSReadiness(t *testing.T) {
	service := newTestService(t)
	service.cfg.ProxyTLSAddr = ":8443"

	now := time.Now().UTC()
	response := service.domainResponse(DomainRecord{
		Name:                    "docs.example.com",
		Type:                    "CUSTOM",
		Status:                  "VERIFIED",
		VerifiedAt:              &now,
		LastVerificationCheckAt: &now,
	})

	if !response.TLSReady {
		t.Fatal("expected tls_ready to be true")
	}
	if response.TLSMode != "acme" {
		t.Fatalf("tls mode = %q, want %q", response.TLSMode, "acme")
	}
	if response.LastVerificationCheckAt == nil {
		t.Fatal("expected last_verification_check_at to be set")
	}
}

func TestInstanceResponseIncludesTLSSummary(t *testing.T) {
	service := newTestService(t)
	service.cfg.ProxyTLSAddr = ":8443"
	service.cfg.AuditExportLimit = 4321

	response := service.instanceResponse()

	if !response.TLSEnabled {
		t.Fatal("expected tls_enabled to be true")
	}
	if response.ProxyTLSAddr != ":8443" {
		t.Fatalf("proxy tls addr = %q, want %q", response.ProxyTLSAddr, ":8443")
	}
	if response.AuditExportLimit != 4321 {
		t.Fatalf("audit export limit = %d, want %d", response.AuditExportLimit, 4321)
	}
}

func TestEmitAuditEventPersistsStructuredFields(t *testing.T) {
	service := newTestService(t)

	recorder := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(recorder)
	ctx.Request = httptest.NewRequest(http.MethodPost, "/api/tunnels", nil)
	ctx.Set("binboi.request_access", requestAccess{
		Identity: &AuthIdentity{
			UserID: "user_a",
			Email:  "owner-a@example.com",
		},
	})
	ctx.Set("binboi.request_id", "req-audit-1")

	service.emitAuditEvent(ctx, auditEventOptions{
		Level:           "info",
		Message:         "Reserved tunnel alpha -> http://localhost:3000",
		Action:          "tunnel.create",
		ResourceType:    "tunnel",
		ResourceID:      "tun_alpha",
		TunnelSubdomain: "alpha",
		Details: map[string]any{
			"target": "http://localhost:3000",
			"region": "local",
		},
	}, false)

	var record EventRecord
	if err := service.db.Order("id desc").First(&record).Error; err != nil {
		t.Fatalf("load event record: %v", err)
	}

	if record.OwnerUserID != "user_a" {
		t.Fatalf("owner user id = %q, want %q", record.OwnerUserID, "user_a")
	}
	if record.ActorEmail != "owner-a@example.com" {
		t.Fatalf("actor email = %q, want %q", record.ActorEmail, "owner-a@example.com")
	}
	if record.Action != "tunnel.create" {
		t.Fatalf("action = %q, want %q", record.Action, "tunnel.create")
	}
	if record.RequestID != "req-audit-1" {
		t.Fatalf("request id = %q, want %q", record.RequestID, "req-audit-1")
	}

	events, err := service.listEvents(requestAccess{TrustedLocal: true}, eventListOptions{
		Limit:  10,
		Action: "tunnel.create",
	})
	if err != nil {
		t.Fatalf("listEvents returned error: %v", err)
	}
	if len(events) != 1 {
		t.Fatalf("event count = %d, want 1", len(events))
	}
	if events[0].Details["target"] != "http://localhost:3000" {
		t.Fatalf("details target = %v, want %q", events[0].Details["target"], "http://localhost:3000")
	}
}

func TestListEventsUsesAuditOwnershipAndTunnelFallback(t *testing.T) {
	service := newTestService(t)
	service.authProvider = stubAuthProvider{enabled: true}

	now := time.Now().UTC()
	tunnels := []TunnelRecord{
		{
			ID:          "tun_alpha",
			Subdomain:   "alpha",
			OwnerUserID: "user_a",
			OwnerEmail:  "owner-a@example.com",
			Target:      "http://localhost:3000",
			Status:      "ACTIVE",
			Region:      "local",
			CreatedAt:   now,
		},
		{
			ID:          "tun_beta",
			Subdomain:   "beta",
			OwnerUserID: "user_b",
			OwnerEmail:  "owner-b@example.com",
			Target:      "http://localhost:4000",
			Status:      "ACTIVE",
			Region:      "local",
			CreatedAt:   now,
		},
	}
	for _, tunnel := range tunnels {
		if err := service.db.Create(&tunnel).Error; err != nil {
			t.Fatalf("insert tunnel: %v", err)
		}
	}

	events := []EventRecord{
		{
			Level:           "info",
			Message:         "Tunnel alpha connected",
			TunnelSubdomain: "alpha",
			CreatedAt:       now,
		},
		{
			Level:        "info",
			Message:      "Registered custom domain docs.example.com",
			Action:       "domain.create",
			ResourceType: "domain",
			ResourceID:   "docs.example.com",
			OwnerUserID:  "user_a",
			OwnerEmail:   "owner-a@example.com",
			CreatedAt:    now.Add(time.Second),
		},
		{
			Level:           "warn",
			Message:         "Tunnel beta disconnected",
			TunnelSubdomain: "beta",
			CreatedAt:       now.Add(2 * time.Second),
		},
		{
			Level:        "warn",
			Message:      "Deleted custom domain evil.example.com",
			Action:       "domain.delete",
			ResourceType: "domain",
			ResourceID:   "evil.example.com",
			OwnerUserID:  "user_b",
			OwnerEmail:   "owner-b@example.com",
			CreatedAt:    now.Add(3 * time.Second),
		},
	}
	for _, event := range events {
		if err := service.db.Create(&event).Error; err != nil {
			t.Fatalf("insert event: %v", err)
		}
	}

	filtered, err := service.listEvents(requestAccess{
		Identity: &AuthIdentity{UserID: "user_a"},
	}, eventListOptions{
		Limit: 10,
	})
	if err != nil {
		t.Fatalf("listEvents returned error: %v", err)
	}
	if len(filtered) != 2 {
		t.Fatalf("event count = %d, want 2", len(filtered))
	}
	if filtered[0].Action != "domain.create" {
		t.Fatalf("latest action = %q, want %q", filtered[0].Action, "domain.create")
	}
	if filtered[1].TunnelSubdomain != "alpha" {
		t.Fatalf("fallback tunnel = %q, want %q", filtered[1].TunnelSubdomain, "alpha")
	}

	actionFiltered, err := service.listEvents(requestAccess{
		Identity: &AuthIdentity{UserID: "user_a"},
	}, eventListOptions{
		Limit:  10,
		Action: "domain.create",
	})
	if err != nil {
		t.Fatalf("listEvents with action filter returned error: %v", err)
	}
	if len(actionFiltered) != 1 {
		t.Fatalf("action-filtered count = %d, want 1", len(actionFiltered))
	}
	if actionFiltered[0].ResourceID != "docs.example.com" {
		t.Fatalf("resource id = %q, want %q", actionFiltered[0].ResourceID, "docs.example.com")
	}
}

func TestVerifyPendingDomainsMarksMatchingTXTAsVerified(t *testing.T) {
	service := newTestService(t)
	service.lookupTXT = func(ctx context.Context, host string) ([]string, error) {
		if host != "docs.example.com" {
			t.Fatalf("lookupTXT host = %q, want %q", host, "docs.example.com")
		}
		return []string{"binboi-verification=expected-value"}, nil
	}

	record, err := service.createDomain("docs.example.com", requestAccess{TrustedLocal: true})
	if err != nil {
		t.Fatalf("createDomain returned error: %v", err)
	}

	record.ExpectedTXT = "binboi-verification=expected-value"
	if err := service.db.Save(&record).Error; err != nil {
		t.Fatalf("save domain expectation: %v", err)
	}

	if err := service.verifyPendingDomains(context.Background()); err != nil {
		t.Fatalf("verifyPendingDomains returned error: %v", err)
	}

	var refreshed DomainRecord
	if err := service.db.Where("name = ?", "docs.example.com").First(&refreshed).Error; err != nil {
		t.Fatalf("reload domain: %v", err)
	}

	if refreshed.Status != "VERIFIED" {
		t.Fatalf("domain status = %q, want %q", refreshed.Status, "VERIFIED")
	}
	if refreshed.VerifiedAt == nil {
		t.Fatal("expected verified_at to be set")
	}
	if refreshed.LastVerificationCheckAt == nil {
		t.Fatal("expected last_verification_check_at to be set")
	}
	if refreshed.ExpectedTXT != "" {
		t.Fatalf("expected verification token to be cleared, got %q", refreshed.ExpectedTXT)
	}
}

func TestRecordObservedRequestPrunesOldRows(t *testing.T) {
	service := newTestService(t)

	tunnel := TunnelRecord{
		ID:         "tunnel_prune",
		Subdomain:  "alpha",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	for i := 0; i < defaultStoredRequestLimit+5; i++ {
		if err := service.recordObservedRequest(tunnel, requestObservation{
			Method:         http.MethodGet,
			Path:           fmt.Sprintf("/events/%d", i),
			Status:         http.StatusOK,
			RequestPreview: fmt.Sprintf("preview-%d", i),
		}); err != nil {
			t.Fatalf("recordObservedRequest #%d: %v", i, err)
		}
	}

	var count int64
	if err := service.db.Model(&RequestRecord{}).Count(&count).Error; err != nil {
		t.Fatalf("count request records: %v", err)
	}
	if count != defaultStoredRequestLimit {
		t.Fatalf("stored request count = %d, want %d", count, defaultStoredRequestLimit)
	}
}

func TestReplayRecordedRequestCreatesReplayRecord(t *testing.T) {
	service := newTestService(t)

	tunnel := TunnelRecord{
		ID:         "tunnel_replay",
		Subdomain:  "alpha",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	clientConn, serverConn := net.Pipe()
	clientSession, err := yamux.Client(clientConn, nil)
	if err != nil {
		t.Fatalf("create yamux client: %v", err)
	}
	serverSession, err := yamux.Server(serverConn, nil)
	if err != nil {
		t.Fatalf("create yamux server: %v", err)
	}
	defer clientSession.Close()
	defer serverSession.Close()

	service.attachSession(tunnel.Subdomain, clientSession, "test-remote")
	defer service.detachSession(tunnel.Subdomain)

	errCh := make(chan error, 1)
	go func() {
		stream, err := serverSession.Accept()
		if err != nil {
			errCh <- err
			return
		}
		defer stream.Close()

		req, err := http.ReadRequest(bufio.NewReader(stream))
		if err != nil {
			errCh <- err
			return
		}

		body, err := io.ReadAll(req.Body)
		if err != nil {
			errCh <- err
			return
		}
		if req.Method != http.MethodPost {
			errCh <- fmt.Errorf("method = %s, want POST", req.Method)
			return
		}
		if req.URL.RequestURI() != "/hooks/stripe?foo=bar" {
			errCh <- fmt.Errorf("path = %s, want /hooks/stripe?foo=bar", req.URL.RequestURI())
			return
		}
		if req.Header.Get("X-Test-Header") != "binboi" {
			errCh <- fmt.Errorf("X-Test-Header = %q, want binboi", req.Header.Get("X-Test-Header"))
			return
		}
		if req.Header.Get("X-Binboi-Redelivery") != "true" {
			errCh <- fmt.Errorf("X-Binboi-Redelivery = %q, want true", req.Header.Get("X-Binboi-Redelivery"))
			return
		}
		if req.Header.Get("X-Binboi-Redelivery-Attempt") != "1" {
			errCh <- fmt.Errorf("X-Binboi-Redelivery-Attempt = %q, want 1", req.Header.Get("X-Binboi-Redelivery-Attempt"))
			return
		}
		if req.Header.Get("X-Binboi-Redelivery-Mode") != "manual-header-replay" {
			errCh <- fmt.Errorf("X-Binboi-Redelivery-Mode = %q, want manual-header-replay", req.Header.Get("X-Binboi-Redelivery-Mode"))
			return
		}
		if req.Header.Get("X-Binboi-Signature-Present") != "true" {
			errCh <- fmt.Errorf("X-Binboi-Signature-Present = %q, want true", req.Header.Get("X-Binboi-Signature-Present"))
			return
		}
		if req.Header.Get("X-Binboi-Original-Provider") != "GitHub" {
			errCh <- fmt.Errorf("X-Binboi-Original-Provider = %q, want GitHub", req.Header.Get("X-Binboi-Original-Provider"))
			return
		}
		if req.Header.Get("X-Binboi-Original-Event-Type") != "push" {
			errCh <- fmt.Errorf("X-Binboi-Original-Event-Type = %q, want push", req.Header.Get("X-Binboi-Original-Event-Type"))
			return
		}
		if req.Header.Get("X-Binboi-Original-Delivery-ID") != "gh-delivery-1" {
			errCh <- fmt.Errorf("X-Binboi-Original-Delivery-ID = %q, want gh-delivery-1", req.Header.Get("X-Binboi-Original-Delivery-ID"))
			return
		}
		if req.Header.Get("X-Binboi-Redelivery-Key") != "gh-delivery-1" {
			errCh <- fmt.Errorf("X-Binboi-Redelivery-Key = %q, want gh-delivery-1", req.Header.Get("X-Binboi-Redelivery-Key"))
			return
		}
		if string(body) != `{"ok":true}` {
			errCh <- fmt.Errorf("body = %q, want %q", string(body), `{"ok":true}`)
			return
		}

		_, err = io.WriteString(stream, "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 17\r\n\r\n{\"replayed\":true}")
		errCh <- err
	}()

	if err := service.recordObservedRequest(tunnel, requestObservation{
		Kind:         "WEBHOOK",
		Provider:     "GitHub",
		EventType:    "push",
		DeliveryID:   "gh-delivery-1",
		MetadataJSON: marshalRequestMetadata(map[string]any{"delivery_id": "gh-delivery-1", "event_type": "push"}),
		Method:       http.MethodPost,
		Path:         "/hooks/stripe?foo=bar",
		Status:       http.StatusOK,
		RequestHeaders: []string{
			"x-test-header: binboi",
			"content-type: application/json",
			"x-github-delivery: gh-delivery-1",
			"x-github-event: push",
			"x-hub-signature-256: sha256=test",
		},
		RequestHeadersJSON: headersToJSON(http.Header{
			"X-Test-Header":       []string{"binboi"},
			"Content-Type":        []string{"application/json"},
			"X-GitHub-Delivery":   []string{"gh-delivery-1"},
			"X-GitHub-Event":      []string{"push"},
			"X-Hub-Signature-256": []string{"sha256=test"},
		}),
		RequestBody:     []byte(`{"ok":true}`),
		RequestPreview:  "POST /hooks/stripe?foo=bar",
		PayloadPreview:  `{"ok":true}`,
		ResponsePreview: `{"ok":true}`,
	}); err != nil {
		t.Fatalf("recordObservedRequest returned error: %v", err)
	}

	var original RequestRecord
	if err := service.db.Order("created_at desc").First(&original).Error; err != nil {
		t.Fatalf("load original request: %v", err)
	}

	result, err := service.replayRecordedRequest(context.Background(), original.ID, requestAccess{TrustedLocal: true})
	if err != nil {
		t.Fatalf("replayRecordedRequest returned error: %v", err)
	}
	if err := <-errCh; err != nil {
		t.Fatalf("relay server returned error: %v", err)
	}
	if result.ProxyStatus != http.StatusOK {
		t.Fatalf("proxy status = %d, want %d", result.ProxyStatus, http.StatusOK)
	}
	if result.ReplayAttempt != 1 {
		t.Fatalf("replay attempt = %d, want 1", result.ReplayAttempt)
	}
	if result.ReplayedRequestID == "" {
		t.Fatal("expected replayed request id to be populated")
	}
	if result.ReplayPolicy == nil {
		t.Fatal("expected replay policy to be populated")
	}
	if result.ReplayPolicy.Provider != "GitHub" {
		t.Fatalf("replay policy provider = %q, want %q", result.ReplayPolicy.Provider, "GitHub")
	}
	if result.ReplayPolicy.DeliveryID != "gh-delivery-1" {
		t.Fatalf("replay policy delivery_id = %q, want %q", result.ReplayPolicy.DeliveryID, "gh-delivery-1")
	}
	if result.ReplayPolicy.DedupeKey != "gh-delivery-1" {
		t.Fatalf("replay policy dedupe_key = %q, want %q", result.ReplayPolicy.DedupeKey, "gh-delivery-1")
	}
	if result.ReplayPolicy.SignaturePresent != true {
		t.Fatalf("replay policy signature_present = %v, want true", result.ReplayPolicy.SignaturePresent)
	}

	var replayed RequestRecord
	if err := service.db.Where("id = ?", result.ReplayedRequestID).First(&replayed).Error; err != nil {
		t.Fatalf("load replayed request: %v", err)
	}
	if replayed.ReplayOfRequestID != original.ID {
		t.Fatalf("replay_of_request_id = %q, want %q", replayed.ReplayOfRequestID, original.ID)
	}
	if replayed.DeliveryID != "gh-delivery-1" {
		t.Fatalf("delivery_id = %q, want %q", replayed.DeliveryID, "gh-delivery-1")
	}
}

func TestReplayRecordedRequestRejectsNestedReplay(t *testing.T) {
	service := newTestService(t)

	tunnel := TunnelRecord{
		ID:         "tunnel_nested_replay",
		Subdomain:  "nested",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	record := RequestRecord{
		ID:                "req_replayed",
		TunnelID:          tunnel.ID,
		TunnelSubdomain:   tunnel.Subdomain,
		ReplayOfRequestID: "req_original",
		Method:            http.MethodPost,
		Path:              "/webhooks/stripe",
		Status:            http.StatusAccepted,
	}
	if err := service.db.Create(&record).Error; err != nil {
		t.Fatalf("insert request record: %v", err)
	}
	if err := service.db.Create(&RequestArchiveRecord{
		RequestID:          record.ID,
		RequestHeadersJSON: headersToJSON(http.Header{"Content-Type": []string{"application/json"}}),
		RequestBody:        []byte(`{"replayed":true}`),
	}).Error; err != nil {
		t.Fatalf("insert request archive: %v", err)
	}

	_, err := service.replayRecordedRequest(context.Background(), record.ID, requestAccess{TrustedLocal: true})
	if !errors.Is(err, errRequestReplayNested) {
		t.Fatalf("replayRecordedRequest error = %v, want %v", err, errRequestReplayNested)
	}
}

func TestReplayRecordedRequestRejectsReplayLimit(t *testing.T) {
	service := newTestService(t)
	service.cfg.RequestReplayLimit = 1

	tunnel := TunnelRecord{
		ID:         "tunnel_replay_limit",
		Subdomain:  "limit",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	original := RequestRecord{
		ID:              "req_original_limit",
		TunnelID:        tunnel.ID,
		TunnelSubdomain: tunnel.Subdomain,
		Method:          http.MethodPost,
		Path:            "/webhooks/github",
		Status:          http.StatusAccepted,
	}
	if err := service.db.Create(&original).Error; err != nil {
		t.Fatalf("insert original request: %v", err)
	}
	if err := service.db.Create(&RequestArchiveRecord{
		RequestID:          original.ID,
		RequestHeadersJSON: headersToJSON(http.Header{"Content-Type": []string{"application/json"}}),
		RequestBody:        []byte(`{"ok":true}`),
	}).Error; err != nil {
		t.Fatalf("insert original archive: %v", err)
	}
	if err := service.db.Create(&RequestRecord{
		ID:                "req_existing_replay",
		TunnelID:          tunnel.ID,
		TunnelSubdomain:   tunnel.Subdomain,
		ReplayOfRequestID: original.ID,
		Method:            http.MethodPost,
		Path:              "/webhooks/github",
		Status:            http.StatusAccepted,
	}).Error; err != nil {
		t.Fatalf("insert existing replay: %v", err)
	}

	_, err := service.replayRecordedRequest(context.Background(), original.ID, requestAccess{TrustedLocal: true})
	if !errors.Is(err, errRequestReplayLimitReached) {
		t.Fatalf("replayRecordedRequest error = %v, want %v", err, errRequestReplayLimitReached)
	}
}

func TestV1ReplayRouteAuditsBlockedReplay(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	tunnel := TunnelRecord{
		ID:         "tunnel_replay_audit",
		Subdomain:  "audit",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	record := RequestRecord{
		ID:                "req_blocked_replay",
		TunnelID:          tunnel.ID,
		TunnelSubdomain:   tunnel.Subdomain,
		ReplayOfRequestID: "req_parent",
		Method:            http.MethodPost,
		Path:              "/hooks/stripe",
		Status:            http.StatusAccepted,
	}
	if err := service.db.Create(&record).Error; err != nil {
		t.Fatalf("insert request record: %v", err)
	}
	if err := service.db.Create(&RequestArchiveRecord{
		RequestID:          record.ID,
		RequestHeadersJSON: headersToJSON(http.Header{"Content-Type": []string{"application/json"}}),
		RequestBody:        []byte(`{"payload":true}`),
	}).Error; err != nil {
		t.Fatalf("insert request archive: %v", err)
	}

	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodPost, "/api/v1/requests/"+record.ID+"/replay", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusConflict {
		t.Fatalf("/api/v1/requests/:id/replay = %d, want %d", recorder.Code, http.StatusConflict)
	}

	var event EventRecord
	if err := service.db.Order("created_at desc").First(&event).Error; err != nil {
		t.Fatalf("load latest event: %v", err)
	}
	if event.Action != "request.replay.blocked" {
		t.Fatalf("event action = %q, want %q", event.Action, "request.replay.blocked")
	}
	if event.ResourceID != record.ID {
		t.Fatalf("event resource_id = %q, want %q", event.ResourceID, record.ID)
	}
}

func TestV1RequestArchiveRouteReturnsCapturedBodies(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	tunnel := TunnelRecord{
		ID:         "tunnel_archive",
		Subdomain:  "archive",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	if err := service.recordObservedRequest(tunnel, requestObservation{
		Kind:                "WEBHOOK",
		Provider:            "GitHub",
		EventType:           "push",
		DeliveryID:          "gh-delivery-archive",
		MetadataJSON:        marshalRequestMetadata(map[string]any{"delivery_id": "gh-delivery-archive", "event_type": "push", "signature_present": true}),
		Method:              http.MethodPost,
		Path:                "/webhooks/github",
		Status:              http.StatusAccepted,
		RequestHeaders:      []string{"x-test-header: archive"},
		RequestHeadersJSON:  headersToJSON(http.Header{"X-Test-Header": []string{"archive"}}),
		ResponseHeaders:     []string{"content-type: application/json"},
		ResponseHeadersJSON: headersToJSON(http.Header{"Content-Type": []string{"application/json"}}),
		RequestBody:         []byte(`{"hello":"world"}`),
		ResponseBody:        []byte(`{"accepted":true}`),
		RequestPreview:      "POST /webhooks/github",
		PayloadPreview:      `{"hello":"world"}`,
		ResponsePreview:     `{"accepted":true}`,
	}); err != nil {
		t.Fatalf("recordObservedRequest returned error: %v", err)
	}

	var record RequestRecord
	if err := service.db.Order("created_at desc").First(&record).Error; err != nil {
		t.Fatalf("load request record: %v", err)
	}

	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/requests/"+record.ID+"/archive", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("/api/v1/requests/:id/archive = %d, want %d", recorder.Code, http.StatusOK)
	}

	var payload struct {
		Data RequestArchiveResponse `json:"data"`
		Meta APIMeta                `json:"meta"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode archive response: %v", err)
	}

	if payload.Data.RequestBodyText != `{"hello":"world"}` {
		t.Fatalf("request body text = %q, want %q", payload.Data.RequestBodyText, `{"hello":"world"}`)
	}
	if payload.Data.ResponseBodyText != `{"accepted":true}` {
		t.Fatalf("response body text = %q, want %q", payload.Data.ResponseBodyText, `{"accepted":true}`)
	}
	if payload.Data.DeliveryID != "gh-delivery-archive" {
		t.Fatalf("delivery id = %q, want %q", payload.Data.DeliveryID, "gh-delivery-archive")
	}
	if payload.Data.Provider != "GitHub" {
		t.Fatalf("provider = %q, want %q", payload.Data.Provider, "GitHub")
	}
	if payload.Data.EventType != "push" {
		t.Fatalf("event type = %q, want %q", payload.Data.EventType, "push")
	}
	if payload.Data.Metadata["signature_present"] != true {
		t.Fatalf("metadata signature_present = %v, want true", payload.Data.Metadata["signature_present"])
	}
	if payload.Data.ReplayPolicy == nil {
		t.Fatal("expected replay policy in archive response")
	}
	if payload.Data.ReplayPolicy.DedupeKey != "gh-delivery-archive" {
		t.Fatalf("archive replay policy dedupe_key = %q, want %q", payload.Data.ReplayPolicy.DedupeKey, "gh-delivery-archive")
	}
}

func TestRequestExportRouteReturnsJSON(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	tunnel := TunnelRecord{
		ID:         "tunnel_export",
		Subdomain:  "export",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	if err := service.recordObservedRequest(tunnel, requestObservation{
		Kind:           "WEBHOOK",
		Provider:       "GitHub",
		EventType:      "push",
		DeliveryID:     "gh-delivery-export",
		MetadataJSON:   marshalRequestMetadata(map[string]any{"delivery_id": "gh-delivery-export", "event_type": "push"}),
		Method:         http.MethodPost,
		Path:           "/hook",
		Status:         http.StatusOK,
		RequestPreview: "POST /hook",
		PayloadPreview: `{"event":"test"}`,
	}); err != nil {
		t.Fatalf("recordObservedRequest returned error: %v", err)
	}

	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/requests/export?format=json", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("/api/requests/export = %d, want %d", recorder.Code, http.StatusOK)
	}
	if contentType := recorder.Header().Get("Content-Type"); !strings.Contains(contentType, "application/json") {
		t.Fatalf("content type = %q, want application/json", contentType)
	}

	var payload []RequestResponse
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode request export: %v", err)
	}
	if len(payload) != 1 {
		t.Fatalf("exported request count = %d, want 1", len(payload))
	}
	if payload[0].Path != "/hook" {
		t.Fatalf("exported path = %q, want /hook", payload[0].Path)
	}
	if payload[0].DeliveryID != "gh-delivery-export" {
		t.Fatalf("exported delivery id = %q, want %q", payload[0].DeliveryID, "gh-delivery-export")
	}
	if payload[0].Metadata["event_type"] != "push" {
		t.Fatalf("exported metadata event_type = %v, want %q", payload[0].Metadata["event_type"], "push")
	}
}

func TestRequestExportRouteSupportsSummaryJSON(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	tunnel := TunnelRecord{
		ID:         "tunnel_export_summary",
		Subdomain:  "export-summary",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	if err := service.recordObservedRequest(tunnel, requestObservation{
		Kind:            "WEBHOOK",
		Provider:        "GitHub",
		EventType:       "push",
		DeliveryID:      "gh-delivery-summary",
		Method:          http.MethodPost,
		Path:            "/hook",
		Status:          http.StatusCreated,
		RequestPreview:  "POST /hook",
		PayloadPreview:  `{"event":"summary"}`,
		ResponsePreview: `{"ok":true}`,
	}); err != nil {
		t.Fatalf("recordObservedRequest returned error: %v", err)
	}

	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/requests/export?format=json&summary=true", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("/api/requests/export summary = %d, want %d", recorder.Code, http.StatusOK)
	}

	var payload []map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode request summary export: %v", err)
	}
	if len(payload) != 1 {
		t.Fatalf("summary request count = %d, want 1", len(payload))
	}
	if payload[0]["delivery_id"] != "gh-delivery-summary" {
		t.Fatalf("summary delivery_id = %v, want %q", payload[0]["delivery_id"], "gh-delivery-summary")
	}
	if _, ok := payload[0]["request_preview"]; ok {
		t.Fatalf("summary payload unexpectedly included request_preview: %#v", payload[0]["request_preview"])
	}
	if _, ok := payload[0]["metadata"]; ok {
		t.Fatalf("summary payload unexpectedly included metadata: %#v", payload[0]["metadata"])
	}
}

func TestRequestExportRouteSupportsGzip(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	tunnel := TunnelRecord{
		ID:         "tunnel_export_gzip",
		Subdomain:  "export-gzip",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	if err := service.recordObservedRequest(tunnel, requestObservation{
		Kind:           "WEBHOOK",
		Provider:       "Stripe",
		EventType:      "payment_intent.succeeded",
		DeliveryID:     "evt_123",
		MetadataJSON:   marshalRequestMetadata(map[string]any{"delivery_id": "evt_123", "event_type": "payment_intent.succeeded"}),
		Method:         http.MethodPost,
		Path:           "/stripe/webhook",
		Status:         http.StatusOK,
		RequestPreview: "POST /stripe/webhook",
		PayloadPreview: `{"id":"evt_123"}`,
	}); err != nil {
		t.Fatalf("recordObservedRequest returned error: %v", err)
	}

	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/requests/export?format=json", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	request.Header.Set("Accept-Encoding", "gzip")
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("/api/requests/export = %d, want %d", recorder.Code, http.StatusOK)
	}
	if recorder.Header().Get("Content-Encoding") != "gzip" {
		t.Fatalf("content encoding = %q, want gzip", recorder.Header().Get("Content-Encoding"))
	}
	if recorder.Header().Get("X-Binboi-Export-Bytes") == "" {
		t.Fatal("expected X-Binboi-Export-Bytes header to be populated")
	}

	var payload []RequestResponse
	if err := json.Unmarshal([]byte(decodeGzipTestBody(t, recorder.Body.Bytes())), &payload); err != nil {
		t.Fatalf("decode gzip request export: %v", err)
	}
	if len(payload) != 1 {
		t.Fatalf("exported request count = %d, want 1", len(payload))
	}
	if payload[0].DeliveryID != "evt_123" {
		t.Fatalf("exported delivery id = %q, want %q", payload[0].DeliveryID, "evt_123")
	}
}

func TestRequestExportRouteRejectsOversizedPayload(t *testing.T) {
	gin.SetMode(gin.TestMode)

	service := newTestService(t)
	service.cfg.ExportMaxBytes = 128
	tunnel := TunnelRecord{
		ID:         "tunnel_export_limit",
		Subdomain:  "export-limit",
		Target:     "http://localhost:3000",
		TargetPort: 3000,
		Status:     "ACTIVE",
		Region:     "local",
	}
	if err := service.db.Create(&tunnel).Error; err != nil {
		t.Fatalf("insert tunnel: %v", err)
	}

	if err := service.recordObservedRequest(tunnel, requestObservation{
		Kind:           "REQUEST",
		Method:         http.MethodPost,
		Path:           "/oversized",
		Status:         http.StatusAccepted,
		RequestPreview: strings.Repeat("preview-", 20),
		PayloadPreview: strings.Repeat("payload-", 20),
	}); err != nil {
		t.Fatalf("recordObservedRequest returned error: %v", err)
	}

	router := gin.New()
	service.RegisterRoutes(router)

	request := httptest.NewRequest(http.MethodGet, "/api/requests/export?format=json", nil)
	request.RemoteAddr = "127.0.0.1:4040"
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("/api/requests/export = %d, want %d", recorder.Code, http.StatusRequestEntityTooLarge)
	}
	if !strings.Contains(recorder.Body.String(), "reduce limit or narrow filters") {
		t.Fatalf("error body = %q, want suggestion", recorder.Body.String())
	}
}

func decodeGzipTestBody(t *testing.T, compressed []byte) string {
	t.Helper()

	reader, err := gzip.NewReader(bytes.NewReader(compressed))
	if err != nil {
		t.Fatalf("create gzip reader: %v", err)
	}
	defer reader.Close()

	body, err := io.ReadAll(reader)
	if err != nil {
		t.Fatalf("read gzip body: %v", err)
	}
	return string(body)
}
