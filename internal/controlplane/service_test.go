package controlplane

import (
	"context"
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
