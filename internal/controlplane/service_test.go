package controlplane

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type stubAuthProvider struct {
	identity *AuthIdentity
	err      error
	enabled  bool
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

func newTestService(t *testing.T) *Service {
	t.Helper()

	db, err := gorm.Open(sqlite.Open(t.TempDir()+"/controlplane.db"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite database: %v", err)
	}
	if err := db.AutoMigrate(&InstanceToken{}, &TunnelRecord{}, &DomainRecord{}, &EventRecord{}, &RequestRecord{}); err != nil {
		t.Fatalf("auto migrate: %v", err)
	}

	service := &Service{
		cfg: Config{
			BaseDomain:    "binboi.localhost",
			PublicScheme:  "http",
			PublicPort:    8000,
			DefaultRegion: "local",
		},
		db:           db,
		sessions:     make(map[string]*activeSession),
		clients:      make(map[*websocket.Conn]struct{}),
		backlog:      make([]string, 0, maxLogBacklog),
		authProvider: &authProvider{},
	}

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

	requests, err := service.listRequests(20, requestAccess{
		Identity: &AuthIdentity{UserID: "user_a"},
	})
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
