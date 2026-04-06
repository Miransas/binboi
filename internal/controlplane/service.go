package controlplane

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/httputil"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/hashicorp/yamux"
	"github.com/miransas/binboi/internal/auth"
	"github.com/miransas/binboi/internal/protocol"
	"github.com/miransas/binboi/internal/utils"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const (
	defaultAPIAddr            = ":8080"
	defaultTunnelAddr         = ":8081"
	defaultProxyAddr          = ":8000"
	defaultBaseDomain         = "binboi.localhost"
	defaultDatabase           = "binboi.db"
	defaultInstance           = "Binboi Self-Hosted"
	defaultRegion             = "local"
	defaultReadHeaderTimeout  = 10 * time.Second
	defaultReadTimeout        = 30 * time.Second
	defaultWriteTimeout       = 60 * time.Second
	defaultIdleTimeout        = 90 * time.Second
	defaultShutdownTimeout    = 10 * time.Second
	defaultRecentEventLimit   = 50
	defaultRecentRequestLimit = 200
	defaultStoredEventLimit   = 1000
	defaultStoredRequestLimit = 5000
	defaultAPIRateLimit       = 240
	defaultAPIRateBurst       = 60
	defaultProxyRateLimit     = 1200
	defaultProxyRateBurst     = 240
	maxLogBacklog             = 100
	maxHeaderPreviewRows      = 10
	maxBodyPreviewBytes       = 4096
)

var (
	subdomainPattern = regexp.MustCompile(`^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$|^[a-z0-9]$`)
	wsUpgrader       = websocket.Upgrader{
		CheckOrigin: func(_ *http.Request) bool { return true },
	}
)

type Config struct {
	APIAddr            string
	TunnelAddr         string
	ProxyAddr          string
	BaseDomain         string
	PublicScheme       string
	PublicPort         int
	DatabasePath       string
	InstanceName       string
	DefaultRegion      string
	AuthDatabaseURL    string
	ReadHeaderTimeout  time.Duration
	ReadTimeout        time.Duration
	WriteTimeout       time.Duration
	IdleTimeout        time.Duration
	ShutdownTimeout    time.Duration
	RecentEventLimit   int
	RecentRequestLimit int
	StoredEventLimit   int
	StoredRequestLimit int
	APIRateLimit       int
	APIRateBurst       int
	ProxyRateLimit     int
	ProxyRateBurst     int
}

func LoadConfigFromEnv() Config {
	cfg := Config{
		APIAddr:            envOrDefault("BINBOI_API_ADDR", defaultAPIAddr),
		TunnelAddr:         envOrDefault("BINBOI_TUNNEL_ADDR", defaultTunnelAddr),
		ProxyAddr:          envOrDefault("BINBOI_PROXY_ADDR", defaultProxyAddr),
		BaseDomain:         envOrDefault("BINBOI_BASE_DOMAIN", defaultBaseDomain),
		PublicScheme:       envOrDefault("BINBOI_PUBLIC_SCHEME", "http"),
		DatabasePath:       envOrDefault("BINBOI_DATABASE_PATH", defaultDatabase),
		InstanceName:       envOrDefault("BINBOI_INSTANCE_NAME", defaultInstance),
		DefaultRegion:      envOrDefault("BINBOI_DEFAULT_REGION", defaultRegion),
		AuthDatabaseURL:    envOrDefault("BINBOI_AUTH_DATABASE_URL", strings.TrimSpace(os.Getenv("DATABASE_URL"))),
		ReadHeaderTimeout:  durationEnvOrDefault("BINBOI_READ_HEADER_TIMEOUT", defaultReadHeaderTimeout),
		ReadTimeout:        durationEnvOrDefault("BINBOI_READ_TIMEOUT", defaultReadTimeout),
		WriteTimeout:       durationEnvOrDefault("BINBOI_WRITE_TIMEOUT", defaultWriteTimeout),
		IdleTimeout:        durationEnvOrDefault("BINBOI_IDLE_TIMEOUT", defaultIdleTimeout),
		ShutdownTimeout:    durationEnvOrDefault("BINBOI_SHUTDOWN_TIMEOUT", defaultShutdownTimeout),
		RecentEventLimit:   intEnvOrDefault("BINBOI_EVENT_LIMIT", defaultRecentEventLimit),
		RecentRequestLimit: intEnvOrDefault("BINBOI_REQUEST_LIMIT", defaultRecentRequestLimit),
		StoredEventLimit:   intEnvOrDefault("BINBOI_STORED_EVENT_LIMIT", defaultStoredEventLimit),
		StoredRequestLimit: intEnvOrDefault("BINBOI_STORED_REQUEST_LIMIT", defaultStoredRequestLimit),
		APIRateLimit:       nonNegativeIntEnvOrDefault("BINBOI_API_RATE_LIMIT", defaultAPIRateLimit),
		APIRateBurst:       nonNegativeIntEnvOrDefault("BINBOI_API_RATE_BURST", defaultAPIRateBurst),
		ProxyRateLimit:     nonNegativeIntEnvOrDefault("BINBOI_PROXY_RATE_LIMIT", defaultProxyRateLimit),
		ProxyRateBurst:     nonNegativeIntEnvOrDefault("BINBOI_PROXY_RATE_BURST", defaultProxyRateBurst),
	}

	if port, err := strconv.Atoi(envOrDefault("BINBOI_PUBLIC_PORT", strconv.Itoa(portFromAddr(cfg.ProxyAddr, 8000)))); err == nil {
		cfg.PublicPort = port
	} else {
		cfg.PublicPort = 8000
	}

	return cfg
}

func envOrDefault(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func durationEnvOrDefault(key string, fallback time.Duration) time.Duration {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := time.ParseDuration(value)
	if err != nil || parsed <= 0 {
		return fallback
	}
	return parsed
}

func intEnvOrDefault(key string, fallback int) int {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed <= 0 {
		return fallback
	}
	return parsed
}

func nonNegativeIntEnvOrDefault(key string, fallback int) int {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed < 0 {
		return fallback
	}
	return parsed
}

func portFromAddr(addr string, fallback int) int {
	_, port, err := net.SplitHostPort(addr)
	if err != nil {
		if strings.HasPrefix(addr, ":") {
			port = strings.TrimPrefix(addr, ":")
		}
	}
	parsed, err := strconv.Atoi(port)
	if err != nil {
		return fallback
	}
	return parsed
}

type InstanceToken struct {
	ID         uint   `gorm:"primaryKey"`
	Value      string `gorm:"uniqueIndex"`
	LastUsedAt *time.Time
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type TunnelRecord struct {
	ID                 string `gorm:"primaryKey"`
	Subdomain          string `gorm:"uniqueIndex"`
	OwnerUserID        string `gorm:"index"`
	OwnerEmail         string
	AuthMode           string
	Target             string
	TargetPort         int
	Status             string
	Region             string
	LastError          string
	RequestCount       int64
	BytesTransferred   int64
	LastConnectedAt    *time.Time
	LastDisconnectedAt *time.Time
	CreatedAt          time.Time
	UpdatedAt          time.Time
}

type DomainRecord struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"uniqueIndex"`
	OwnerUserID string `gorm:"index"`
	OwnerEmail  string
	Type        string
	Status      string
	ExpectedTXT string
	VerifiedAt  *time.Time
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type EventRecord struct {
	ID              uint `gorm:"primaryKey"`
	Level           string
	Message         string
	TunnelSubdomain string
	CreatedAt       time.Time
}

type RequestRecord struct {
	ID              string `gorm:"primaryKey"`
	TunnelID        string `gorm:"index"`
	TunnelSubdomain string `gorm:"index"`
	Kind            string
	Provider        string
	EventType       string
	Method          string
	Path            string
	Status          int
	DurationMs      int64
	Source          string
	Target          string
	Destination     string
	ErrorType       string
	RequestHeaders  string `gorm:"type:text"`
	ResponseHeaders string `gorm:"type:text"`
	RequestPreview  string `gorm:"type:text"`
	PayloadPreview  string `gorm:"type:text"`
	ResponsePreview string `gorm:"type:text"`
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

type activeSession struct {
	session     *yamux.Session
	remoteAddr  string
	connectedAt time.Time
}

type Service struct {
	cfg          Config
	db           *gorm.DB
	authProvider accessAuthenticator
	startedAt    time.Time
	metrics      runtimeMetrics
	apiLimiter   *requestRateLimiter
	proxyLimiter *requestRateLimiter

	mu       sync.RWMutex
	sessions map[string]*activeSession

	logMu   sync.Mutex
	clients map[*websocket.Conn]struct{}
	backlog []string
}

type requestAccess struct {
	Identity     *AuthIdentity
	TrustedLocal bool
}

type routeAccessError struct {
	Status  int
	Message string
}

type TunnelResponse struct {
	ID              string     `json:"id"`
	Subdomain       string     `json:"subdomain"`
	Target          string     `json:"target"`
	Status          string     `json:"status"`
	Region          string     `json:"region"`
	RequestCount    int64      `json:"request_count"`
	BytesOut        int64      `json:"bytes_out"`
	CreatedAt       time.Time  `json:"created_at"`
	LastConnectedAt *time.Time `json:"last_connected_at,omitempty"`
	PublicURL       string     `json:"public_url"`
}

type DomainResponse struct {
	Name        string     `json:"name"`
	Type        string     `json:"type"`
	Status      string     `json:"status"`
	ExpectedTXT string     `json:"expected_txt"`
	VerifiedAt  *time.Time `json:"verified_at,omitempty"`
}

type NodeResponse struct {
	Name        string `json:"name"`
	Region      string `json:"region"`
	Address     string `json:"address"`
	Status      string `json:"status"`
	Description string `json:"description"`
}

type EventResponse struct {
	Level           string    `json:"level"`
	Message         string    `json:"message"`
	TunnelSubdomain string    `json:"tunnel_subdomain,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

type RequestResponse struct {
	ID              string    `json:"id"`
	TunnelID        string    `json:"tunnel_id"`
	TunnelSubdomain string    `json:"tunnel_subdomain"`
	Kind            string    `json:"kind"`
	Provider        string    `json:"provider,omitempty"`
	EventType       string    `json:"event_type,omitempty"`
	Method          string    `json:"method"`
	Path            string    `json:"path"`
	Status          int       `json:"status"`
	DurationMs      int64     `json:"duration_ms"`
	Source          string    `json:"source,omitempty"`
	Target          string    `json:"target,omitempty"`
	Destination     string    `json:"destination,omitempty"`
	ErrorType       string    `json:"error_type,omitempty"`
	RequestHeaders  []string  `json:"request_headers,omitempty"`
	ResponseHeaders []string  `json:"response_headers,omitempty"`
	RequestPreview  string    `json:"request_preview,omitempty"`
	PayloadPreview  string    `json:"payload_preview,omitempty"`
	ResponsePreview string    `json:"response_preview,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
}

type InstanceResponse struct {
	InstanceName     string `json:"instance_name"`
	Database         string `json:"database"`
	DatabasePath     string `json:"database_path"`
	ManagedDomain    string `json:"managed_domain"`
	PublicURLExample string `json:"public_url_example"`
	APIAddr          string `json:"api_addr"`
	TunnelAddr       string `json:"tunnel_addr"`
	ProxyAddr        string `json:"proxy_addr"`
	AuthMode         string `json:"auth_mode"`
	ActiveTunnels    int    `json:"active_tunnels"`
	ReservedTunnels  int64  `json:"reserved_tunnels"`
}

type APIMeta struct {
	InstanceName string    `json:"instance_name"`
	AuthMode     string    `json:"auth_mode"`
	AccessScope  string    `json:"access_scope"`
	GeneratedAt  time.Time `json:"generated_at"`
}

type APIEnvelope[T any] struct {
	Data T       `json:"data"`
	Meta APIMeta `json:"meta"`
}

type APIErrorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type APIErrorEnvelope struct {
	Error APIErrorDetail `json:"error"`
	Meta  APIMeta        `json:"meta"`
}

func NewService(cfg Config) (*Service, error) {
	db, err := gorm.Open(sqlite.Open(cfg.DatabasePath), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("open sqlite database: %w", err)
	}

	if err := db.AutoMigrate(&InstanceToken{}, &TunnelRecord{}, &DomainRecord{}, &EventRecord{}, &RequestRecord{}); err != nil {
		return nil, fmt.Errorf("migrate sqlite database: %w", err)
	}

	service := &Service{
		cfg:       cfg,
		db:        db,
		startedAt: time.Now().UTC(),
		sessions:  make(map[string]*activeSession),
		clients:   make(map[*websocket.Conn]struct{}),
		backlog:   make([]string, 0, maxLogBacklog),
	}

	authProvider, err := newAuthProvider(cfg.AuthDatabaseURL)
	if err != nil {
		return nil, err
	}
	service.authProvider = authProvider
	service.configureRuntimeGuards()

	if err := service.ensureDefaults(); err != nil {
		return nil, err
	}

	return service, nil
}

func (s *Service) Close(ctx context.Context) error {
	if ctx == nil {
		ctx = context.Background()
	}

	var closeErr error

	_ = s.closeAllSessions("control plane shutting down")

	s.logMu.Lock()
	for client := range s.clients {
		_ = client.WriteControl(
			websocket.CloseMessage,
			websocket.FormatCloseMessage(websocket.CloseGoingAway, "control plane shutting down"),
			time.Now().Add(250*time.Millisecond),
		)
		_ = client.Close()
		delete(s.clients, client)
	}
	s.logMu.Unlock()

	if s.authProvider != nil {
		closeErr = errors.Join(closeErr, s.authProvider.Close())
	}

	if s.db != nil {
		sqlDB, err := s.db.DB()
		if err != nil {
			closeErr = errors.Join(closeErr, err)
		} else {
			done := make(chan error, 1)
			go func() {
				done <- sqlDB.Close()
			}()

			select {
			case err := <-done:
				closeErr = errors.Join(closeErr, err)
			case <-ctx.Done():
				closeErr = errors.Join(closeErr, ctx.Err())
			}
		}
	}

	return closeErr
}

func (s *Service) ensureDefaults() error {
	var count int64
	if err := s.db.Model(&InstanceToken{}).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		if err := s.db.Create(&InstanceToken{Value: auth.GenerateSecureToken()}).Error; err != nil {
			return err
		}
	}

	var domainCount int64
	if err := s.db.Model(&DomainRecord{}).Where("name = ?", s.cfg.BaseDomain).Count(&domainCount).Error; err != nil {
		return err
	}
	if domainCount == 0 {
		now := time.Now().UTC()
		if err := s.db.Create(&DomainRecord{
			Name:       s.cfg.BaseDomain,
			Type:       "MANAGED",
			Status:     "VERIFIED",
			VerifiedAt: &now,
		}).Error; err != nil {
			return err
		}
	}

	return nil
}

func (s *Service) configureRuntimeGuards() {
	s.apiLimiter = newRequestRateLimiter(s.cfg.APIRateLimit, s.cfg.APIRateBurst)
	s.proxyLimiter = newRequestRateLimiter(s.cfg.ProxyRateLimit, s.cfg.ProxyRateBurst)
}

func (s *Service) RegisterRoutes(r *gin.Engine) {
	r.Use(gin.Recovery())
	r.Use(s.requestContext())
	r.Use(s.requestLogger())

	r.GET("/ws/logs", s.handleLogsSocket)
	r.GET("/metrics", s.requireControlPlaneAccess(), s.handlePrometheusMetrics)

	api := r.Group("/api")
	api.Use(s.apiRateLimit(false))
	api.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
	api.GET("/instance", func(c *gin.Context) {
		c.JSON(http.StatusOK, s.instanceResponse())
	})
	api.GET("/nodes", func(c *gin.Context) {
		c.JSON(http.StatusOK, s.listNodes())
	})
	api.GET("/metrics", s.requireControlPlaneAccess(), s.handleMetrics)

	operator := api.Group("/")
	operator.Use(s.requireControlPlaneAccess())
	operator.GET("/events", s.handleListEvents)
	operator.GET("/requests", s.handleListRequests)
	operator.GET("/tunnels", s.handleListTunnels)
	operator.GET("/tunnels/:scope", s.handleListTunnels)
	operator.POST("/tunnels", s.handleCreateTunnel)
	operator.DELETE("/tunnels/:id", s.handleDeleteTunnel)
	operator.GET("/domains", s.handleListDomains)
	operator.POST("/domains", s.handleCreateDomain)
	operator.DELETE("/domains/:name", s.handleDeleteDomain)
	operator.POST("/domains/verify", s.handleVerifyDomain)

	admin := api.Group("/")
	admin.Use(s.requireTrustedLocalAccess())
	admin.GET("/tokens/current", s.handleCurrentToken)
	admin.POST("/tokens/generate", s.handleGenerateToken)
	admin.POST("/tokens/revoke", s.handleRevokeSessions)

	apiV1 := r.Group("/api/v1")
	apiV1.Use(s.apiRateLimit(true))
	apiV1.GET("/health", s.handleV1Health)
	apiV1.GET("/instance", s.handleV1Instance)
	apiV1.GET("/nodes", s.handleV1Nodes)
	apiV1.GET("/metrics", s.requireControlPlaneAccess(), s.handleV1Metrics)
	apiV1Operator := apiV1.Group("/")
	apiV1Operator.Use(s.requireControlPlaneAccess())
	apiV1Operator.GET("/events", s.handleV1ListEvents)
	apiV1Operator.GET("/requests", s.handleV1ListRequests)
	apiV1Operator.GET("/tunnels", s.handleV1ListTunnels)
	apiV1Operator.POST("/tunnels", s.handleV1CreateTunnel)
	apiV1Operator.DELETE("/tunnels/:id", s.handleV1DeleteTunnel)
	apiV1Operator.GET("/domains", s.handleV1ListDomains)
	apiV1Operator.POST("/domains", s.handleV1CreateDomain)
	apiV1Operator.DELETE("/domains/:name", s.handleV1DeleteDomain)
	apiV1Operator.POST("/domains/verify", s.handleV1VerifyDomain)
	apiV1.GET("/auth/me", s.handleAuthMe)
}

func (s *Service) apiMeta(access requestAccess) APIMeta {
	authMode := "instance-token-preview"
	if s.authProvider != nil {
		authMode = s.authProvider.Mode()
	}
	instanceName := fallbackString(s.cfg.InstanceName, defaultInstance)

	accessScope := "anonymous"
	if access.Identity != nil {
		accessScope = "token"
	} else if access.TrustedLocal {
		accessScope = "trusted-local"
	}

	return APIMeta{
		InstanceName: instanceName,
		AuthMode:     authMode,
		AccessScope:  accessScope,
		GeneratedAt:  time.Now().UTC(),
	}
}

func writeV1Success[T any](c *gin.Context, status int, meta APIMeta, data T) {
	c.JSON(status, APIEnvelope[T]{
		Data: data,
		Meta: meta,
	})
}

func writeV1Error(c *gin.Context, status int, meta APIMeta, code, message string) {
	c.JSON(status, APIErrorEnvelope{
		Error: APIErrorDetail{
			Code:    code,
			Message: message,
		},
		Meta: meta,
	})
}

func (s *Service) handleV1Health(c *gin.Context) {
	writeV1Success(c, http.StatusOK, s.apiMeta(requestAccess{}), gin.H{"status": "ok"})
}

func (s *Service) handleV1Instance(c *gin.Context) {
	writeV1Success(c, http.StatusOK, s.apiMeta(requestAccess{}), s.instanceResponse())
}

func (s *Service) handleV1Nodes(c *gin.Context) {
	writeV1Success(c, http.StatusOK, s.apiMeta(requestAccess{}), s.listNodes())
}

func (s *Service) HandleTunnelConnection(conn net.Conn) {
	defer conn.Close()

	buf := make([]byte, 4096)
	n, err := conn.Read(buf)
	if err != nil {
		s.broadcastLog("error", fmt.Sprintf("Tunnel handshake failed: %v", err), "")
		return
	}

	msg, err := protocol.Decode(buf[:n])
	if err != nil {
		s.writeHandshakeError(conn, "invalid handshake payload")
		return
	}

	var payload protocol.HandshakePayload
	if err := json.Unmarshal(msg.Payload, &payload); err != nil {
		s.writeHandshakeError(conn, "could not parse handshake")
		return
	}

	authToken := strings.TrimSpace(payload.AuthToken)
	if authToken == "" {
		authToken = strings.TrimSpace(payload.Token)
	}

	subdomain, err := normalizeSubdomain(payload.Subdomain)
	if err != nil {
		s.writeHandshakeError(conn, err.Error())
		return
	}

	if payload.LocalPort <= 0 {
		s.writeHandshakeError(conn, "local port must be a positive integer")
		return
	}

	identity, err := s.authenticateToken(authToken)
	if err != nil {
		s.writeHandshakeError(conn, err.Error())
		s.recordTunnelConnectionRejected()
		s.broadcastLog("warn", fmt.Sprintf("Rejected tunnel connection for %s", subdomain), subdomain)
		return
	}

	if err := s.upsertTunnelOnConnect(subdomain, payload.LocalPort, identity); err != nil {
		s.recordTunnelConnectionRejected()
		s.broadcastLog("warn", fmt.Sprintf("Rejected tunnel connection for %s: %v", subdomain, err), subdomain)
		s.writeHandshakeError(conn, err.Error())
		return
	}

	response := protocol.HandshakeResponse{
		Status:  "success",
		Message: "Tunnel is ready",
		URL:     s.BuildPublicURL(subdomain),
	}

	encodedPayload, _ := json.Marshal(response)
	encodedMessage, _ := (&protocol.Message{
		Type:    protocol.TypeHandshakeAck,
		Payload: encodedPayload,
	}).Encode()

	if _, err := conn.Write(encodedMessage); err != nil {
		s.broadcastLog("error", fmt.Sprintf("Failed to send handshake response for %s: %v", subdomain, err), subdomain)
		return
	}

	session, err := yamux.Server(conn, nil)
	if err != nil {
		s.broadcastLog("error", fmt.Sprintf("Failed to open yamux session for %s: %v", subdomain, err), subdomain)
		_ = s.markTunnelStatus(subdomain, "ERROR", "Failed to create yamux session")
		return
	}

	s.attachSession(subdomain, session, conn.RemoteAddr().String())
	defer s.detachSession(subdomain)

	s.recordTunnelConnectionAccepted()
	s.broadcastLog("info", fmt.Sprintf("Tunnel %s connected from %s as %s", subdomain, conn.RemoteAddr().String(), identity.Email), subdomain)
	<-session.CloseChan()
}

func (s *Service) ServeProxy() http.Handler {
	return s.withProxyObservability(s.withProxyRateLimit(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		subdomain := extractSubdomain(r.Host, s.cfg.BaseDomain)
		if subdomain == "" {
			s.renderProxyLanding(w)
			return
		}

		active, tunnel, err := s.lookupActiveTunnel(subdomain)
		if err != nil {
			http.Error(w, "Tunnel not found", http.StatusNotFound)
			return
		}
		requestSnapshot := captureRequestSnapshot(r)
		if active == nil {
			_ = s.recordObservedRequest(tunnel, requestObservation{
				Kind:           requestSnapshot.Kind,
				Provider:       requestSnapshot.Provider,
				EventType:      requestSnapshot.EventType,
				Method:         r.Method,
				Path:           requestSnapshot.Path,
				Status:         http.StatusBadGateway,
				DurationMs:     0,
				Source:         requestSnapshot.Source,
				Target:         tunnel.Target,
				Destination:    tunnel.Target,
				ErrorType:      "TUNNEL_OFFLINE",
				RequestHeaders: requestSnapshot.HeaderLines,
				ResponseHeaders: []string{
					"content-type: text/plain; charset=utf-8",
				},
				RequestPreview:  requestSnapshot.RequestPreview,
				PayloadPreview:  requestSnapshot.PayloadPreview,
				ResponsePreview: "Tunnel is currently offline.",
			})
			http.Error(w, "Tunnel is currently offline", http.StatusBadGateway)
			return
		}

		stream, err := active.session.Open()
		if err != nil {
			s.broadcastLog("error", fmt.Sprintf("Could not open stream for %s: %v", subdomain, err), subdomain)
			_ = s.recordObservedRequest(tunnel, requestObservation{
				Kind:           requestSnapshot.Kind,
				Provider:       requestSnapshot.Provider,
				EventType:      requestSnapshot.EventType,
				Method:         r.Method,
				Path:           requestSnapshot.Path,
				Status:         http.StatusServiceUnavailable,
				DurationMs:     0,
				Source:         requestSnapshot.Source,
				Target:         tunnel.Target,
				Destination:    tunnel.Target,
				ErrorType:      "STREAM_UNAVAILABLE",
				RequestHeaders: requestSnapshot.HeaderLines,
				ResponseHeaders: []string{
					"content-type: text/plain; charset=utf-8",
				},
				RequestPreview:  requestSnapshot.RequestPreview,
				PayloadPreview:  requestSnapshot.PayloadPreview,
				ResponsePreview: "Tunnel stream unavailable.",
			})
			http.Error(w, "Tunnel stream unavailable", http.StatusServiceUnavailable)
			return
		}

		counter := newCountingConn(stream, func(total int64) {
			_ = s.recordProxyTraffic(subdomain, total)
		})

		captureWriter := newStatusCapturingResponseWriter(w)
		proxy := &httputil.ReverseProxy{
			Director: func(req *http.Request) {
				req.URL.Scheme = "http"
				req.URL.Host = r.Host
				req.Host = r.Host
				req.Header.Set(requestIDHeader, r.Header.Get(requestIDHeader))
				req.Header.Set("X-Forwarded-Proto", s.cfg.PublicScheme)
				req.Header.Set("X-Forwarded-Host", r.Host)
				req.Header.Set("X-Binboi-Subdomain", subdomain)
			},
			Transport: &http.Transport{
				DialContext: func(_ context.Context, _, _ string) (net.Conn, error) {
					return counter, nil
				},
			},
			ErrorHandler: func(rw http.ResponseWriter, req *http.Request, proxyErr error) {
				s.broadcastLog("error", fmt.Sprintf("Proxy error for %s: %v", subdomain, proxyErr), subdomain)
				http.Error(rw, "Proxy request failed", http.StatusBadGateway)
			},
		}

		s.broadcastLog("info", fmt.Sprintf("%s %s -> %s", r.Method, r.URL.Path, tunnel.Target), subdomain)
		startedAt := time.Now().UTC()
		_ = s.incrementRequestCount(subdomain)
		proxy.ServeHTTP(captureWriter, r)

		durationMs := time.Since(startedAt).Milliseconds()
		_ = s.recordObservedRequest(tunnel, requestObservation{
			Kind:            requestSnapshot.Kind,
			Provider:        requestSnapshot.Provider,
			EventType:       requestSnapshot.EventType,
			Method:          r.Method,
			Path:            requestSnapshot.Path,
			Status:          captureWriter.Status(),
			DurationMs:      durationMs,
			Source:          requestSnapshot.Source,
			Target:          tunnel.Target,
			Destination:     tunnel.Target,
			ErrorType:       classifyRequestError(captureWriter.Status(), requestSnapshot.Kind, captureWriter.BodyPreview(), requestSnapshot.ResponsePreviewHint),
			RequestHeaders:  requestSnapshot.HeaderLines,
			ResponseHeaders: formatHeadersForPreview(captureWriter.Header()),
			RequestPreview:  requestSnapshot.RequestPreview,
			PayloadPreview:  requestSnapshot.PayloadPreview,
			ResponsePreview: fallbackString(captureWriter.BodyPreview(), requestSnapshot.ResponsePreviewHint),
		})
	})))
}

func (s *Service) BuildPublicURL(subdomain string) string {
	host := fmt.Sprintf("%s.%s", subdomain, s.cfg.BaseDomain)
	if (s.cfg.PublicScheme == "http" && s.cfg.PublicPort == 80) || (s.cfg.PublicScheme == "https" && s.cfg.PublicPort == 443) {
		return fmt.Sprintf("%s://%s", s.cfg.PublicScheme, host)
	}
	return fmt.Sprintf("%s://%s:%d", s.cfg.PublicScheme, host, s.cfg.PublicPort)
}

func (s *Service) handleLogsSocket(c *gin.Context) {
	access, accessErr := s.resolveRequestAccess(c.Request)
	if accessErr != nil {
		c.JSON(accessErr.Status, gin.H{"error": accessErr.Message})
		return
	}
	if access.Identity != nil {
		// The websocket is currently an operator log stream. Machine tokens can use
		// the HTTP APIs, but live logs stay reserved for local control-plane access.
		c.JSON(http.StatusForbidden, gin.H{"error": "live log streaming is only available from the local control plane host"})
		return
	}

	conn, err := wsUpgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	s.logMu.Lock()
	s.clients[conn] = struct{}{}
	backlog := append([]string(nil), s.backlog...)
	s.logMu.Unlock()

	for i := len(backlog) - 1; i >= 0; i-- {
		if err := conn.WriteMessage(websocket.TextMessage, []byte(backlog[i])); err != nil {
			conn.Close()
			return
		}
	}

	defer func() {
		s.logMu.Lock()
		delete(s.clients, conn)
		s.logMu.Unlock()
		conn.Close()
	}()

	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			return
		}
	}
}

func (s *Service) requireControlPlaneAccess() gin.HandlerFunc {
	return func(c *gin.Context) {
		access, accessErr := s.resolveRequestAccess(c.Request)
		if accessErr != nil {
			c.AbortWithStatusJSON(accessErr.Status, gin.H{"error": accessErr.Message})
			return
		}

		c.Set("binboi.request_access", access)
		c.Next()
	}
}

func (s *Service) requireTrustedLocalAccess() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !isTrustedLocalRequest(c.Request) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "This endpoint is only available from the local Binboi control plane host.",
			})
			return
		}

		c.Set("binboi.request_access", requestAccess{TrustedLocal: true})
		c.Next()
	}
}

func (s *Service) resolveRequestAccess(r *http.Request) (requestAccess, *routeAccessError) {
	token := extractBearerToken(r)
	if token != "" {
		identity, err := s.authenticateToken(token)
		if err != nil {
			return requestAccess{}, &routeAccessError{
				Status:  http.StatusUnauthorized,
				Message: "invalid access token",
			}
		}
		return requestAccess{Identity: identity}, nil
	}

	if isTrustedLocalRequest(r) {
		return requestAccess{TrustedLocal: true}, nil
	}

	return requestAccess{}, &routeAccessError{
		Status:  http.StatusUnauthorized,
		Message: "missing access token",
	}
}

func currentRequestAccess(c *gin.Context) requestAccess {
	value, ok := c.Get("binboi.request_access")
	if !ok {
		return requestAccess{}
	}

	access, ok := value.(requestAccess)
	if !ok {
		return requestAccess{}
	}

	return access
}

func isTrustedLocalRequest(r *http.Request) bool {
	host, _, err := net.SplitHostPort(strings.TrimSpace(r.RemoteAddr))
	if err != nil {
		host = strings.TrimSpace(r.RemoteAddr)
	}
	ip := net.ParseIP(host)
	if ip == nil {
		return false
	}

	return ip.IsLoopback() || ip.IsPrivate() || ip.IsUnspecified()
}

func (s *Service) handleListTunnels(c *gin.Context) {
	records, err := s.listTunnels(currentRequestAccess(c), c.Param("scope"))
	if err != nil {
		status := http.StatusInternalServerError
		if strings.Contains(strings.ToLower(err.Error()), "unsupported tunnel scope") {
			status = http.StatusBadRequest
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, records)
}

func (s *Service) handleListEvents(c *gin.Context) {
	events, err := s.listEvents(currentRequestAccess(c), eventListOptions{
		Limit:  parsePositiveLimit(c.Query("limit"), s.recentEventLimit(), 500),
		Level:  c.Query("level"),
		Tunnel: c.Query("tunnel"),
		Query:  c.Query("q"),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load events"})
		return
	}
	c.JSON(http.StatusOK, events)
}

func (s *Service) handleListRequests(c *gin.Context) {
	requests, err := s.listRequests(currentRequestAccess(c), requestListOptions{
		Limit:       parsePositiveLimit(c.Query("limit"), s.recentRequestLimit(), 500),
		Kind:        c.Query("kind"),
		Tunnel:      c.Query("tunnel"),
		Provider:    c.Query("provider"),
		Query:       c.Query("q"),
		StatusClass: c.Query("status"),
		ErrorOnly:   parseBoolQuery(c.Query("error_only")),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list requests"})
		return
	}
	c.JSON(http.StatusOK, requests)
}

func (s *Service) handleCreateTunnel(c *gin.Context) {
	var req struct {
		Subdomain string `json:"subdomain"`
		Target    string `json:"target"`
		Region    string `json:"region"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tunnel payload"})
		return
	}

	record, err := s.createTunnel(req.Subdomain, req.Target, req.Region, currentRequestAccess(c))
	if err != nil {
		status := http.StatusBadRequest
		if strings.Contains(strings.ToLower(err.Error()), "already reserved") {
			status = http.StatusConflict
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	s.broadcastLog("info", fmt.Sprintf("Reserved tunnel %s -> %s", record.Subdomain, record.Target), record.Subdomain)
	c.JSON(http.StatusCreated, s.mapTunnelRecord(record))
}

func (s *Service) handleDeleteTunnel(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing tunnel id"})
		return
	}

	if err := s.deleteTunnel(id, currentRequestAccess(c)); err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
		} else if strings.Contains(strings.ToLower(err.Error()), "another account") {
			status = http.StatusForbidden
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "deleted"})
}

func (s *Service) handleCurrentToken(c *gin.Context) {
	if s.authProvider != nil && s.authProvider.Enabled() {
		c.JSON(http.StatusConflict, gin.H{"error": "Personal access tokens are managed through the dashboard API."})
		return
	}

	token, err := s.currentToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":        token.Value,
		"created_at":   formatTime(&token.CreatedAt),
		"last_used_at": formatTime(token.LastUsedAt),
		"active_nodes": s.activeTunnelCount(),
	})
}

func (s *Service) handleGenerateToken(c *gin.Context) {
	if s.authProvider != nil && s.authProvider.Enabled() {
		c.JSON(http.StatusConflict, gin.H{"error": "Personal access tokens are managed through the dashboard API."})
		return
	}

	token, err := s.rotateToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to rotate token"})
		return
	}

	s.broadcastLog("info", "Generated a new preview relay token", "")
	c.JSON(http.StatusOK, gin.H{"status": "success", "token": token})
}

func (s *Service) handleRevokeSessions(c *gin.Context) {
	if s.authProvider != nil && s.authProvider.Enabled() {
		c.JSON(http.StatusConflict, gin.H{"error": "Personal access tokens are managed through the dashboard API."})
		return
	}

	if err := s.closeAllSessions("token revoke requested from dashboard"); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to revoke sessions"})
		return
	}

	s.broadcastLog("warn", "Revoked all active tunnel sessions", "")
	c.JSON(http.StatusOK, gin.H{"status": "all_sessions_terminated"})
}

func (s *Service) handleListDomains(c *gin.Context) {
	domains, err := s.listDomains(currentRequestAccess(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load domains"})
		return
	}
	c.JSON(http.StatusOK, domains)
}

func (s *Service) handleCreateDomain(c *gin.Context) {
	var req struct {
		Domain string `json:"domain"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid domain payload"})
		return
	}

	record, err := s.createDomain(req.Domain, currentRequestAccess(c))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, DomainResponse{
		Name:        record.Name,
		Type:        record.Type,
		Status:      record.Status,
		ExpectedTXT: record.ExpectedTXT,
		VerifiedAt:  record.VerifiedAt,
	})
}

func (s *Service) handleDeleteDomain(c *gin.Context) {
	name := c.Param("name")
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing domain name"})
		return
	}

	if err := s.deleteDomain(name, currentRequestAccess(c)); err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
		} else if strings.Contains(strings.ToLower(err.Error()), "another account") {
			status = http.StatusForbidden
		} else if strings.Contains(strings.ToLower(err.Error()), "managed base domain") {
			status = http.StatusConflict
		} else {
			status = http.StatusBadRequest
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "deleted", "name": name})
}

func (s *Service) handleVerifyDomain(c *gin.Context) {
	var req struct {
		DomainName string `json:"domain_name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid domain payload"})
		return
	}

	result, err := s.verifyDomain(req.DomainName, currentRequestAccess(c))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status := http.StatusOK
	if result.Status != "VERIFIED" {
		status = http.StatusAccepted
	}

	c.JSON(status, result)
}

func (s *Service) currentToken() (*InstanceToken, error) {
	var token InstanceToken
	if err := s.db.First(&token).Error; err != nil {
		return nil, err
	}
	return &token, nil
}

func (s *Service) validateInstanceToken(raw string) error {
	token, err := s.currentToken()
	if err != nil {
		return err
	}
	if strings.TrimSpace(raw) == "" || raw != token.Value {
		return errors.New("invalid token")
	}

	now := time.Now().UTC()
	return s.db.Model(token).Update("last_used_at", &now).Error
}

func (s *Service) authenticateToken(raw string) (*AuthIdentity, error) {
	if s.authProvider != nil && s.authProvider.Enabled() {
		return s.authProvider.ValidateAccessToken(context.Background(), raw)
	}

	if err := s.validateInstanceToken(raw); err != nil {
		return nil, err
	}

	return &AuthIdentity{
		UserID:      "local-operator",
		Name:        "Local Operator",
		Email:       "operator@binboi.local",
		Plan:        "PRO",
		TokenPrefix: auth.SafeTokenLabel(raw),
		AuthMode:    "instance-token-preview",
	}, nil
}

func (s *Service) handleAuthMe(c *gin.Context) {
	identity, err := s.authenticateToken(extractBearerToken(c.Request))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or missing access token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":    identity.UserID,
			"name":  identity.Name,
			"email": identity.Email,
			"plan":  identity.Plan,
		},
		"token_prefix": identity.TokenPrefix,
		"auth_mode":    identity.AuthMode,
	})
}

func parsePositiveLimit(raw string, fallback, max int) int {
	if strings.TrimSpace(raw) == "" {
		return fallback
	}

	value, err := strconv.Atoi(strings.TrimSpace(raw))
	if err != nil || value <= 0 {
		return fallback
	}
	if value > max {
		return max
	}
	return value
}

func (s *Service) recentEventLimit() int {
	if s.cfg.RecentEventLimit > 0 {
		return s.cfg.RecentEventLimit
	}
	return defaultRecentEventLimit
}

func (s *Service) recentRequestLimit() int {
	if s.cfg.RecentRequestLimit > 0 {
		return s.cfg.RecentRequestLimit
	}
	return defaultRecentRequestLimit
}

func (s *Service) storedEventLimit() int {
	if s.cfg.StoredEventLimit > 0 {
		return s.cfg.StoredEventLimit
	}
	return defaultStoredEventLimit
}

func (s *Service) storedRequestLimit() int {
	if s.cfg.StoredRequestLimit > 0 {
		return s.cfg.StoredRequestLimit
	}
	return defaultStoredRequestLimit
}

func (s *Service) handleV1ListTunnels(c *gin.Context) {
	access := currentRequestAccess(c)
	meta := s.apiMeta(access)
	records, err := s.listTunnels(access, c.Query("scope"))
	if err != nil {
		status := http.StatusInternalServerError
		if strings.Contains(strings.ToLower(err.Error()), "unsupported tunnel scope") {
			status = http.StatusBadRequest
		}
		writeV1Error(c, status, meta, "TUNNELS_LIST_FAILED", err.Error())
		return
	}
	writeV1Success(c, http.StatusOK, meta, records)
}

func (s *Service) handleV1ListEvents(c *gin.Context) {
	access := currentRequestAccess(c)
	meta := s.apiMeta(access)
	events, err := s.listEvents(access, eventListOptions{
		Limit:  parsePositiveLimit(c.Query("limit"), s.recentEventLimit(), 500),
		Level:  c.Query("level"),
		Tunnel: c.Query("tunnel"),
		Query:  c.Query("q"),
	})
	if err != nil {
		writeV1Error(c, http.StatusInternalServerError, meta, "EVENTS_LIST_FAILED", "failed to load events")
		return
	}
	writeV1Success(c, http.StatusOK, meta, events)
}

func (s *Service) handleV1ListRequests(c *gin.Context) {
	access := currentRequestAccess(c)
	meta := s.apiMeta(access)
	requests, err := s.listRequests(access, requestListOptions{
		Limit:       parsePositiveLimit(c.Query("limit"), s.recentRequestLimit(), 500),
		Kind:        c.Query("kind"),
		Tunnel:      c.Query("tunnel"),
		Provider:    c.Query("provider"),
		Query:       c.Query("q"),
		StatusClass: c.Query("status"),
		ErrorOnly:   parseBoolQuery(c.Query("error_only")),
	})
	if err != nil {
		writeV1Error(c, http.StatusInternalServerError, meta, "REQUESTS_LIST_FAILED", "failed to list requests")
		return
	}
	writeV1Success(c, http.StatusOK, meta, requests)
}

func (s *Service) handleV1CreateTunnel(c *gin.Context) {
	access := currentRequestAccess(c)
	meta := s.apiMeta(access)

	var req struct {
		Subdomain string `json:"subdomain"`
		Target    string `json:"target"`
		Region    string `json:"region"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		writeV1Error(c, http.StatusBadRequest, meta, "INVALID_TUNNEL_PAYLOAD", "invalid tunnel payload")
		return
	}

	record, err := s.createTunnel(req.Subdomain, req.Target, req.Region, access)
	if err != nil {
		status := http.StatusBadRequest
		if strings.Contains(strings.ToLower(err.Error()), "already reserved") {
			status = http.StatusConflict
		}
		writeV1Error(c, status, meta, "TUNNEL_CREATE_FAILED", err.Error())
		return
	}

	s.broadcastLog("info", fmt.Sprintf("Reserved tunnel %s -> %s", record.Subdomain, record.Target), record.Subdomain)
	writeV1Success(c, http.StatusCreated, meta, s.mapTunnelRecord(record))
}

func (s *Service) handleV1DeleteTunnel(c *gin.Context) {
	access := currentRequestAccess(c)
	meta := s.apiMeta(access)
	id := c.Param("id")
	if id == "" {
		writeV1Error(c, http.StatusBadRequest, meta, "MISSING_TUNNEL_ID", "missing tunnel id")
		return
	}

	if err := s.deleteTunnel(id, access); err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
		} else if strings.Contains(strings.ToLower(err.Error()), "another account") {
			status = http.StatusForbidden
		}
		writeV1Error(c, status, meta, "TUNNEL_DELETE_FAILED", err.Error())
		return
	}

	writeV1Success(c, http.StatusOK, meta, gin.H{"status": "deleted", "id": id})
}

func (s *Service) handleV1ListDomains(c *gin.Context) {
	access := currentRequestAccess(c)
	meta := s.apiMeta(access)
	domains, err := s.listDomains(access)
	if err != nil {
		writeV1Error(c, http.StatusInternalServerError, meta, "DOMAINS_LIST_FAILED", "failed to load domains")
		return
	}
	writeV1Success(c, http.StatusOK, meta, domains)
}

func (s *Service) handleV1CreateDomain(c *gin.Context) {
	access := currentRequestAccess(c)
	meta := s.apiMeta(access)

	var req struct {
		Domain string `json:"domain"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		writeV1Error(c, http.StatusBadRequest, meta, "INVALID_DOMAIN_PAYLOAD", "invalid domain payload")
		return
	}

	record, err := s.createDomain(req.Domain, access)
	if err != nil {
		writeV1Error(c, http.StatusBadRequest, meta, "DOMAIN_CREATE_FAILED", err.Error())
		return
	}

	writeV1Success(c, http.StatusCreated, meta, DomainResponse{
		Name:        record.Name,
		Type:        record.Type,
		Status:      record.Status,
		ExpectedTXT: record.ExpectedTXT,
		VerifiedAt:  record.VerifiedAt,
	})
}

func (s *Service) handleV1DeleteDomain(c *gin.Context) {
	access := currentRequestAccess(c)
	meta := s.apiMeta(access)
	name := c.Param("name")
	if name == "" {
		writeV1Error(c, http.StatusBadRequest, meta, "MISSING_DOMAIN_NAME", "missing domain name")
		return
	}

	if err := s.deleteDomain(name, access); err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, gorm.ErrRecordNotFound) {
			status = http.StatusNotFound
		} else if strings.Contains(strings.ToLower(err.Error()), "another account") {
			status = http.StatusForbidden
		} else if strings.Contains(strings.ToLower(err.Error()), "managed base domain") {
			status = http.StatusConflict
		} else {
			status = http.StatusBadRequest
		}
		writeV1Error(c, status, meta, "DOMAIN_DELETE_FAILED", err.Error())
		return
	}

	writeV1Success(c, http.StatusOK, meta, gin.H{"status": "deleted", "name": name})
}

func (s *Service) handleV1VerifyDomain(c *gin.Context) {
	access := currentRequestAccess(c)
	meta := s.apiMeta(access)

	var req struct {
		DomainName string `json:"domain_name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		writeV1Error(c, http.StatusBadRequest, meta, "INVALID_DOMAIN_PAYLOAD", "invalid domain payload")
		return
	}

	result, err := s.verifyDomain(req.DomainName, access)
	if err != nil {
		writeV1Error(c, http.StatusBadRequest, meta, "DOMAIN_VERIFY_FAILED", err.Error())
		return
	}

	status := http.StatusOK
	if result.Status != "VERIFIED" {
		status = http.StatusAccepted
	}

	writeV1Success(c, status, meta, result)
}

func (s *Service) rotateToken() (string, error) {
	token, err := s.currentToken()
	if err != nil {
		return "", err
	}

	newValue := auth.GenerateSecureToken()
	if err := s.db.Model(token).Updates(map[string]any{
		"value":        newValue,
		"last_used_at": nil,
	}).Error; err != nil {
		return "", err
	}

	return newValue, nil
}

func (s *Service) listTunnels(access requestAccess, scope string) ([]TunnelResponse, error) {
	var records []TunnelRecord
	query := s.db.Model(&TunnelRecord{})
	if access.Identity != nil && s.authProvider != nil && s.authProvider.Enabled() {
		query = query.Where("owner_user_id = ?", access.Identity.UserID)
	}

	switch strings.ToLower(strings.TrimSpace(scope)) {
	case "active":
		query = query.Where("status = ?", "ACTIVE")
	case "inactive":
		query = query.Where("status <> ?", "ACTIVE")
	case "", "all":
	default:
		return nil, errors.New("unsupported tunnel scope")
	}

	if err := query.Order("created_at desc").Find(&records).Error; err != nil {
		return nil, err
	}

	response := make([]TunnelResponse, 0, len(records))
	for _, record := range records {
		response = append(response, s.mapTunnelRecord(record))
	}
	return response, nil
}

func (s *Service) mapTunnelRecord(record TunnelRecord) TunnelResponse {
	return TunnelResponse{
		ID:              record.ID,
		Subdomain:       record.Subdomain,
		Target:          record.Target,
		Status:          record.Status,
		Region:          record.Region,
		RequestCount:    record.RequestCount,
		BytesOut:        record.BytesTransferred,
		CreatedAt:       record.CreatedAt,
		LastConnectedAt: record.LastConnectedAt,
		PublicURL:       s.BuildPublicURL(record.Subdomain),
	}
}

func (s *Service) createTunnel(subdomain, target, region string, access requestAccess) (TunnelRecord, error) {
	normalizedSubdomain, err := normalizeSubdomain(subdomain)
	if err != nil {
		return TunnelRecord{}, err
	}

	normalizedTarget, targetPort, err := normalizeTarget(target)
	if err != nil {
		return TunnelRecord{}, err
	}

	record := TunnelRecord{
		ID:         uuid.NewString(),
		Subdomain:  normalizedSubdomain,
		Target:     normalizedTarget,
		TargetPort: targetPort,
		Status:     "INACTIVE",
		Region:     fallbackString(region, s.cfg.DefaultRegion),
	}
	if access.Identity != nil {
		record.OwnerUserID = access.Identity.UserID
		record.OwnerEmail = access.Identity.Email
		record.AuthMode = access.Identity.AuthMode
	}

	if err := s.db.Create(&record).Error; err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique") {
			return TunnelRecord{}, errors.New("subdomain is already reserved")
		}
		return TunnelRecord{}, err
	}

	return record, nil
}

func (s *Service) upsertTunnelOnConnect(subdomain string, localPort int, identity *AuthIdentity) error {
	now := time.Now().UTC()
	target := fmt.Sprintf("http://localhost:%d", localPort)

	var record TunnelRecord
	err := s.db.Where("subdomain = ?", subdomain).First(&record).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		record = TunnelRecord{
			ID:              uuid.NewString(),
			Subdomain:       subdomain,
			OwnerUserID:     identity.UserID,
			OwnerEmail:      identity.Email,
			AuthMode:        identity.AuthMode,
			Target:          target,
			TargetPort:      localPort,
			Status:          "ACTIVE",
			Region:          s.cfg.DefaultRegion,
			LastConnectedAt: &now,
		}
		return s.db.Create(&record).Error
	}
	if err != nil {
		return err
	}
	if s.authProvider != nil && s.authProvider.Enabled() && record.OwnerUserID != "" && record.OwnerUserID != identity.UserID {
		return errors.New("subdomain is reserved by another account")
	}

	return s.db.Model(&record).Updates(map[string]any{
		"owner_user_id":     fallbackString(record.OwnerUserID, identity.UserID),
		"owner_email":       fallbackString(record.OwnerEmail, identity.Email),
		"auth_mode":         fallbackString(record.AuthMode, identity.AuthMode),
		"target":            target,
		"target_port":       localPort,
		"status":            "ACTIVE",
		"region":            fallbackString(record.Region, s.cfg.DefaultRegion),
		"last_error":        "",
		"last_connected_at": &now,
	}).Error
}

func (s *Service) deleteTunnel(id string, access requestAccess) error {
	var record TunnelRecord
	if err := s.db.Where("id = ?", id).First(&record).Error; err != nil {
		return err
	}
	if access.Identity != nil && s.authProvider != nil && s.authProvider.Enabled() && record.OwnerUserID != "" && record.OwnerUserID != access.Identity.UserID {
		return errors.New("tunnel belongs to another account")
	}

	s.mu.Lock()
	if active, ok := s.sessions[record.Subdomain]; ok {
		_ = active.session.Close()
		delete(s.sessions, record.Subdomain)
	}
	s.mu.Unlock()

	s.broadcastLog("warn", fmt.Sprintf("Deleted tunnel %s", record.Subdomain), record.Subdomain)
	return s.db.Delete(&record).Error
}

func (s *Service) markTunnelStatus(subdomain, status, lastError string) error {
	updates := map[string]any{
		"status":     status,
		"last_error": lastError,
	}
	if status == "INACTIVE" || status == "ERROR" {
		now := time.Now().UTC()
		updates["last_disconnected_at"] = &now
	}
	return s.db.Model(&TunnelRecord{}).Where("subdomain = ?", subdomain).Updates(updates).Error
}

func (s *Service) attachSession(subdomain string, session *yamux.Session, remoteAddr string) {
	s.mu.Lock()
	if existing, ok := s.sessions[subdomain]; ok {
		_ = existing.session.Close()
	}
	s.sessions[subdomain] = &activeSession{
		session:     session,
		remoteAddr:  remoteAddr,
		connectedAt: time.Now().UTC(),
	}
	s.mu.Unlock()
}

func (s *Service) detachSession(subdomain string) {
	s.mu.Lock()
	delete(s.sessions, subdomain)
	s.mu.Unlock()

	_ = s.markTunnelStatus(subdomain, "INACTIVE", "")
	s.broadcastLog("info", fmt.Sprintf("Tunnel %s disconnected", subdomain), subdomain)
}

func (s *Service) lookupActiveTunnel(subdomain string) (*activeSession, TunnelRecord, error) {
	var record TunnelRecord
	if err := s.db.Where("subdomain = ?", subdomain).First(&record).Error; err != nil {
		return nil, TunnelRecord{}, err
	}

	s.mu.RLock()
	active := s.sessions[subdomain]
	s.mu.RUnlock()
	return active, record, nil
}

func (s *Service) closeAllSessions(reason string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for subdomain, active := range s.sessions {
		_ = active.session.Close()
		delete(s.sessions, subdomain)
		_ = s.markTunnelStatus(subdomain, "INACTIVE", reason)
	}

	return nil
}

func (s *Service) recordProxyTraffic(subdomain string, total int64) error {
	if total <= 0 {
		return nil
	}
	return s.db.Model(&TunnelRecord{}).
		Where("subdomain = ?", subdomain).
		UpdateColumn("bytes_transferred", gorm.Expr("bytes_transferred + ?", total)).
		Error
}

func (s *Service) incrementRequestCount(subdomain string) error {
	return s.db.Model(&TunnelRecord{}).
		Where("subdomain = ?", subdomain).
		UpdateColumn("request_count", gorm.Expr("request_count + 1")).
		Error
}

func (s *Service) listDomains(access requestAccess) ([]DomainResponse, error) {
	var records []DomainRecord
	query := s.db.Model(&DomainRecord{})
	if access.Identity != nil && s.authProvider != nil && s.authProvider.Enabled() {
		query = query.Where("owner_user_id = ? OR type = ?", access.Identity.UserID, "MANAGED")
	}
	if err := query.Order("created_at asc").Find(&records).Error; err != nil {
		return nil, err
	}

	response := make([]DomainResponse, 0, len(records))
	for _, record := range records {
		response = append(response, DomainResponse{
			Name:        record.Name,
			Type:        record.Type,
			Status:      record.Status,
			ExpectedTXT: record.ExpectedTXT,
			VerifiedAt:  record.VerifiedAt,
		})
	}
	return response, nil
}

func (s *Service) createDomain(name string, access requestAccess) (DomainRecord, error) {
	domain, err := normalizeDomainName(name, s.cfg.BaseDomain)
	if err != nil {
		return DomainRecord{}, err
	}

	record := DomainRecord{
		Name:        domain,
		OwnerUserID: "",
		OwnerEmail:  "",
		Type:        "CUSTOM",
		Status:      "PENDING",
		ExpectedTXT: fmt.Sprintf("binboi-verification=%s", uuid.NewString()),
	}
	if access.Identity != nil {
		record.OwnerUserID = access.Identity.UserID
		record.OwnerEmail = access.Identity.Email
	}

	if err := s.db.Create(&record).Error; err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique") {
			return DomainRecord{}, errors.New("domain already exists")
		}
		return DomainRecord{}, err
	}

	return record, nil
}

func (s *Service) verifyDomain(name string, access requestAccess) (DomainResponse, error) {
	domain, err := normalizeDomainName(name, "")
	if err != nil {
		return DomainResponse{}, err
	}

	var record DomainRecord
	query := s.db.Where("name = ?", domain)
	if access.Identity != nil && s.authProvider != nil && s.authProvider.Enabled() {
		query = query.Where("(owner_user_id = ? OR type = ?)", access.Identity.UserID, "MANAGED")
	}
	if err := query.First(&record).Error; err != nil {
		return DomainResponse{}, err
	}

	if record.Type == "MANAGED" {
		return DomainResponse{
			Name:        record.Name,
			Type:        record.Type,
			Status:      "VERIFIED",
			ExpectedTXT: record.ExpectedTXT,
			VerifiedAt:  record.VerifiedAt,
		}, nil
	}

	txtRecords, err := net.LookupTXT(record.Name)
	if err != nil {
		return DomainResponse{
			Name:        record.Name,
			Type:        record.Type,
			Status:      record.Status,
			ExpectedTXT: record.ExpectedTXT,
			VerifiedAt:  record.VerifiedAt,
		}, nil
	}

	for _, txtRecord := range txtRecords {
		if strings.Contains(txtRecord, record.ExpectedTXT) {
			now := time.Now().UTC()
			record.Status = "VERIFIED"
			record.VerifiedAt = &now
			record.ExpectedTXT = ""
			if err := s.db.Save(&record).Error; err != nil {
				return DomainResponse{}, err
			}
			s.broadcastLog("info", fmt.Sprintf("Verified custom domain %s", record.Name), "")
			break
		}
	}

	return DomainResponse{
		Name:        record.Name,
		Type:        record.Type,
		Status:      record.Status,
		ExpectedTXT: record.ExpectedTXT,
		VerifiedAt:  record.VerifiedAt,
	}, nil
}

func (s *Service) deleteDomain(name string, access requestAccess) error {
	domain, err := normalizeDomainName(name, "")
	if err != nil {
		return err
	}

	var record DomainRecord
	query := s.db.Where("name = ?", domain)
	if access.Identity != nil && s.authProvider != nil && s.authProvider.Enabled() {
		query = query.Where("(owner_user_id = ? OR type = ?)", access.Identity.UserID, "MANAGED")
	}
	if err := query.First(&record).Error; err != nil {
		return err
	}
	if record.Type == "MANAGED" {
		return errors.New("managed base domain cannot be deleted")
	}
	if access.Identity != nil && s.authProvider != nil && s.authProvider.Enabled() && record.OwnerUserID != "" && record.OwnerUserID != access.Identity.UserID {
		return errors.New("domain belongs to another account")
	}

	if err := s.db.Delete(&record).Error; err != nil {
		return err
	}

	s.broadcastLog("warn", fmt.Sprintf("Deleted custom domain %s", record.Name), "")
	return nil
}

func (s *Service) listNodes() []NodeResponse {
	status := "online"
	if s.activeTunnelCount() == 0 {
		status = "idle"
	}
	return []NodeResponse{
		{
			Name:        "primary-relay",
			Region:      s.cfg.DefaultRegion,
			Address:     s.cfg.ProxyAddr,
			Status:      status,
			Description: "Single-node HTTP relay used by the self-hosted MVP.",
		},
	}
}

func (s *Service) listEvents(access requestAccess, options eventListOptions) ([]EventResponse, error) {
	var records []EventRecord
	options.Level = normalizeEventLevelFilter(options.Level)
	options.Tunnel = strings.ToLower(strings.TrimSpace(options.Tunnel))
	options.Query = normalizeSearchQuery(options.Query)

	query := s.db.Model(&EventRecord{})
	if access.Identity != nil && s.authProvider != nil && s.authProvider.Enabled() {
		query = query.Joins("JOIN tunnel_records ON tunnel_records.subdomain = event_records.tunnel_subdomain").
			Where("tunnel_records.owner_user_id = ?", access.Identity.UserID)
	}
	if options.Level != "" {
		query = query.Where("LOWER(event_records.level) = ?", options.Level)
	}
	if options.Tunnel != "" {
		query = query.Where("LOWER(event_records.tunnel_subdomain) = ?", options.Tunnel)
	}
	if options.Query != "" {
		like := "%" + options.Query + "%"
		query = query.Where("LOWER(event_records.message) LIKE ?", like)
	}
	if err := query.Order("event_records.created_at desc").Limit(options.Limit).Find(&records).Error; err != nil {
		return nil, err
	}

	response := make([]EventResponse, 0, len(records))
	for _, record := range records {
		response = append(response, EventResponse{
			Level:           record.Level,
			Message:         record.Message,
			TunnelSubdomain: record.TunnelSubdomain,
			CreatedAt:       record.CreatedAt,
		})
	}
	return response, nil
}

func (s *Service) listRequests(access requestAccess, options requestListOptions) ([]RequestResponse, error) {
	var records []RequestRecord
	options.Kind = normalizeRequestKindFilter(options.Kind)
	options.Provider = strings.ToLower(strings.TrimSpace(options.Provider))
	options.Tunnel = strings.ToLower(strings.TrimSpace(options.Tunnel))
	options.Query = normalizeSearchQuery(options.Query)
	options.StatusClass = normalizeStatusClassFilter(options.StatusClass)

	query := s.db.Model(&RequestRecord{})
	if access.Identity != nil && s.authProvider != nil && s.authProvider.Enabled() {
		query = query.Joins("JOIN tunnel_records ON tunnel_records.id = request_records.tunnel_id").
			Where("tunnel_records.owner_user_id = ?", access.Identity.UserID)
	}
	if options.Kind != "" {
		query = query.Where("request_records.kind = ?", options.Kind)
	}
	if options.Tunnel != "" {
		query = query.Where("LOWER(request_records.tunnel_subdomain) = ?", options.Tunnel)
	}
	if options.Provider != "" {
		query = query.Where("LOWER(request_records.provider) = ?", options.Provider)
	}
	if options.ErrorOnly {
		query = query.Where("request_records.status >= ?", http.StatusBadRequest)
	}
	switch options.StatusClass {
	case "success":
		query = query.Where("request_records.status < ?", http.StatusBadRequest)
	case "client_error":
		query = query.Where("request_records.status >= ? AND request_records.status < ?", http.StatusBadRequest, http.StatusInternalServerError)
	case "server_error":
		query = query.Where("request_records.status >= ?", http.StatusInternalServerError)
	case "error":
		query = query.Where("request_records.status >= ?", http.StatusBadRequest)
	}
	if options.Query != "" {
		like := "%" + options.Query + "%"
		query = query.Where(`
			LOWER(request_records.method) LIKE ? OR
			LOWER(request_records.path) LIKE ? OR
			LOWER(request_records.provider) LIKE ? OR
			LOWER(request_records.event_type) LIKE ? OR
			LOWER(request_records.error_type) LIKE ? OR
			LOWER(request_records.destination) LIKE ? OR
			LOWER(request_records.request_preview) LIKE ? OR
			LOWER(request_records.response_preview) LIKE ? OR
			LOWER(request_records.payload_preview) LIKE ?
		`, like, like, like, like, like, like, like, like, like)
	}
	if err := query.Order("request_records.created_at desc").Limit(options.Limit).Find(&records).Error; err != nil {
		return nil, err
	}

	response := make([]RequestResponse, 0, len(records))
	for _, record := range records {
		response = append(response, RequestResponse{
			ID:              record.ID,
			TunnelID:        record.TunnelID,
			TunnelSubdomain: record.TunnelSubdomain,
			Kind:            record.Kind,
			Provider:        record.Provider,
			EventType:       record.EventType,
			Method:          record.Method,
			Path:            record.Path,
			Status:          record.Status,
			DurationMs:      record.DurationMs,
			Source:          record.Source,
			Target:          record.Target,
			Destination:     record.Destination,
			ErrorType:       record.ErrorType,
			RequestHeaders:  splitPreviewLines(record.RequestHeaders),
			ResponseHeaders: splitPreviewLines(record.ResponseHeaders),
			RequestPreview:  record.RequestPreview,
			PayloadPreview:  record.PayloadPreview,
			ResponsePreview: record.ResponsePreview,
			CreatedAt:       record.CreatedAt,
		})
	}

	return response, nil
}

func (s *Service) instanceResponse() InstanceResponse {
	var total int64
	_ = s.db.Model(&TunnelRecord{}).Count(&total).Error

	databaseMode := "sqlite"
	authMode := "instance-token-preview"
	if s.authProvider != nil && s.authProvider.Enabled() {
		databaseMode = "sqlite + postgres"
		authMode = "personal-access-token"
	}

	return InstanceResponse{
		InstanceName:     fallbackString(s.cfg.InstanceName, defaultInstance),
		Database:         databaseMode,
		DatabasePath:     s.cfg.DatabasePath,
		ManagedDomain:    s.cfg.BaseDomain,
		PublicURLExample: s.BuildPublicURL("my-app"),
		APIAddr:          s.cfg.APIAddr,
		TunnelAddr:       s.cfg.TunnelAddr,
		ProxyAddr:        s.cfg.ProxyAddr,
		AuthMode:         authMode,
		ActiveTunnels:    s.activeTunnelCount(),
		ReservedTunnels:  total,
	}
}

func (s *Service) activeTunnelCount() int {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return len(s.sessions)
}

func (s *Service) renderProxyLanding(w http.ResponseWriter) {
	tunnels, err := s.listTunnels(requestAccess{TrustedLocal: true}, "")
	if err != nil {
		http.Error(w, "Control plane is unavailable", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	authCopy := `Create an access token in the dashboard, run <code>binboi login --token &lt;token&gt;</code>, and then expose your local app with <code>binboi http 3000 your-subdomain</code>.`
	if s.authProvider == nil || !s.authProvider.Enabled() {
		authCopy = `This local preview mode uses one instance token in SQLite. Save it with <code>binboi login --token &lt;token&gt;</code> and then expose your local app with <code>binboi http 3000 your-subdomain</code>.`
	}
	fmt.Fprintf(w, `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>%s</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:#050505; color:#fff; margin:0; padding:48px; }
      .card { max-width:960px; margin:0 auto; background:#0d0d0d; border:1px solid rgba(255,255,255,.08); border-radius:24px; padding:32px; }
      h1 { margin:0 0 12px; font-size:42px; }
      p, li { color:#a1a1aa; line-height:1.7; }
      code { color:#00ffd1; }
      table { width:100%%; border-collapse:collapse; margin-top:24px; }
      th, td { padding:14px 12px; border-top:1px solid rgba(255,255,255,.08); text-align:left; }
      th { color:#71717a; font-size:12px; text-transform:uppercase; letter-spacing:.12em; }
      .pill { display:inline-block; padding:4px 10px; border-radius:999px; background:rgba(0,255,209,.1); color:#00ffd1; font-size:12px; }
    </style>
  </head>
  <body>
    <div class="card">
      <span class="pill">HTTP proxy</span>
      <h1>%s</h1>
      <p>Send traffic to a tunnel subdomain such as <code>%s</code>. The dashboard is available on <code>http://localhost:3000/dashboard</code> during local development.</p>
      <p>%s</p>
      <table>
        <thead>
          <tr><th>Subdomain</th><th>Status</th><th>Target</th><th>Public URL</th></tr>
        </thead>
        <tbody>`, s.cfg.InstanceName, s.cfg.InstanceName, s.BuildPublicURL("my-app"), authCopy)

	if len(tunnels) == 0 {
		fmt.Fprint(w, `<tr><td colspan="4">No tunnels have been reserved yet.</td></tr>`)
	} else {
		for _, tunnel := range tunnels {
			fmt.Fprintf(w, `<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>`, tunnel.Subdomain, tunnel.Status, tunnel.Target, tunnel.PublicURL)
		}
	}

	fmt.Fprint(w, `</tbody></table></div></body></html>`)
}

func (s *Service) broadcastLog(level, message, subdomain string) {
	line := fmt.Sprintf("%s [%s] %s", time.Now().UTC().Format(time.RFC3339), strings.ToUpper(level), message)

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

	s.logRuntimeEvent(slogLevelFromString(level), message, "component", "controlplane", "tunnel_subdomain", subdomain)

	if err := s.db.Create(&EventRecord{
		Level:           strings.ToLower(level),
		Message:         message,
		TunnelSubdomain: subdomain,
	}).Error; err == nil {
		_ = s.pruneEventRecords(s.storedEventLimit())
	}
}

func (s *Service) writeHandshakeError(conn net.Conn, message string) {
	response := protocol.HandshakeResponse{
		Status:  "error",
		Message: message,
	}
	encodedPayload, _ := json.Marshal(response)
	encodedMessage, _ := (&protocol.Message{
		Type:    protocol.TypeError,
		Payload: encodedPayload,
	}).Encode()
	_, _ = conn.Write(encodedMessage)
}

type countingConn struct {
	net.Conn
	onClose func(total int64)
	read    int64
	written int64
	once    sync.Once
}

func newCountingConn(inner net.Conn, onClose func(total int64)) *countingConn {
	return &countingConn{Conn: inner, onClose: onClose}
}

func (c *countingConn) Read(p []byte) (int, error) {
	n, err := c.Conn.Read(p)
	atomic.AddInt64(&c.read, int64(n))
	return n, err
}

func (c *countingConn) Write(p []byte) (int, error) {
	n, err := c.Conn.Write(p)
	atomic.AddInt64(&c.written, int64(n))
	return n, err
}

func (c *countingConn) Close() error {
	err := c.Conn.Close()
	c.once.Do(func() {
		if c.onClose != nil {
			c.onClose(atomic.LoadInt64(&c.read) + atomic.LoadInt64(&c.written))
		}
	})
	return err
}

func extractSubdomain(hostHeader, baseDomain string) string {
	host := hostHeader
	if strings.Contains(host, ":") {
		if parsedHost, _, err := net.SplitHostPort(host); err == nil {
			host = parsedHost
		} else {
			host = strings.Split(host, ":")[0]
		}
	}

	host = strings.ToLower(strings.TrimSpace(host))
	baseDomain = strings.ToLower(strings.TrimSpace(baseDomain))

	if host == "" || host == "localhost" || host == baseDomain {
		return ""
	}
	if !strings.HasSuffix(host, "."+baseDomain) {
		return ""
	}

	return strings.TrimSuffix(host, "."+baseDomain)
}

func extractBearerToken(r *http.Request) string {
	authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
	if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
		return strings.TrimSpace(authHeader[7:])
	}
	return strings.TrimSpace(r.Header.Get("X-Binboi-Token"))
}

func normalizeSubdomain(raw string) (string, error) {
	value := strings.ToLower(strings.TrimSpace(raw))
	if value == "" {
		value = utils.GenerateCyberName()
	}
	value = strings.ReplaceAll(value, "_", "-")

	if !subdomainPattern.MatchString(value) {
		return "", errors.New("subdomain must use lowercase letters, numbers, and hyphens")
	}
	return value, nil
}

func normalizeTarget(raw string) (string, int, error) {
	value := strings.TrimSpace(raw)
	if value == "" {
		value = "http://localhost:3000"
	}
	if _, err := strconv.Atoi(value); err == nil {
		value = fmt.Sprintf("http://localhost:%s", value)
	}
	if !strings.Contains(value, "://") {
		value = "http://" + value
	}

	parsed := strings.TrimPrefix(value, "http://")
	host, portString, err := net.SplitHostPort(parsed)
	if err != nil {
		return "", 0, errors.New("target must include a host and port")
	}
	port, err := strconv.Atoi(portString)
	if err != nil || port <= 0 {
		return "", 0, errors.New("target port must be a positive integer")
	}
	if host == "" {
		return "", 0, errors.New("target host is required")
	}

	return value, port, nil
}

func fallbackString(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

type requestSnapshot struct {
	Path                string
	Kind                string
	Provider            string
	EventType           string
	Source              string
	HeaderLines         []string
	RequestPreview      string
	PayloadPreview      string
	ResponsePreviewHint string
}

type requestObservation struct {
	Kind            string
	Provider        string
	EventType       string
	Method          string
	Path            string
	Status          int
	DurationMs      int64
	Source          string
	Target          string
	Destination     string
	ErrorType       string
	RequestHeaders  []string
	ResponseHeaders []string
	RequestPreview  string
	PayloadPreview  string
	ResponsePreview string
}

func captureRequestSnapshot(r *http.Request) requestSnapshot {
	path := r.URL.RequestURI()
	headerLines := formatHeadersForPreview(r.Header)
	payloadPreview := captureRequestBodyPreview(r)
	kind, provider := inferTrafficKind(path, r.Header)
	eventType := inferEventType(r.Header, payloadPreview)
	requestPreview := strings.TrimSpace(strings.Join([]string{
		fmt.Sprintf("%s %s", r.Method, path),
		joinPreviewSegments(headerLines[:min(len(headerLines), 3)]),
	}, " | "))

	responseHint := "No response body preview was captured."
	if strings.EqualFold(kind, "WEBHOOK") {
		responseHint = "The request reached the webhook target but did not return a captured response body preview."
	}

	return requestSnapshot{
		Path:                path,
		Kind:                kind,
		Provider:            provider,
		EventType:           eventType,
		Source:              formatSource(r.RemoteAddr),
		HeaderLines:         headerLines,
		RequestPreview:      requestPreview,
		PayloadPreview:      payloadPreview,
		ResponsePreviewHint: responseHint,
	}
}

func captureRequestBodyPreview(r *http.Request) string {
	if r.Body == nil {
		return ""
	}
	if r.ContentLength < 0 || r.ContentLength > maxBodyPreviewBytes {
		return ""
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		return ""
	}
	r.Body = io.NopCloser(bytes.NewReader(body))

	return compactPreview(string(body), maxBodyPreviewBytes)
}

func inferTrafficKind(path string, headers http.Header) (string, string) {
	lowerPath := strings.ToLower(path)

	switch {
	case headers.Get("stripe-signature") != "":
		return "WEBHOOK", "Stripe"
	case headers.Get("svix-signature") != "" || headers.Get("svix-id") != "":
		return "WEBHOOK", "Clerk"
	case headers.Get("x-supabase-signature") != "":
		return "WEBHOOK", "Supabase"
	case headers.Get("x-hub-signature-256") != "" || headers.Get("x-github-event") != "":
		return "WEBHOOK", "GitHub"
	case headers.Get("linear-signature") != "":
		return "WEBHOOK", "Linear"
	case strings.Contains(lowerPath, "stripe"):
		return "WEBHOOK", "Stripe"
	case strings.Contains(lowerPath, "clerk"):
		return "WEBHOOK", "Clerk"
	case strings.Contains(lowerPath, "supabase"):
		return "WEBHOOK", "Supabase"
	case strings.Contains(lowerPath, "github"):
		return "WEBHOOK", "GitHub"
	case strings.Contains(lowerPath, "linear"):
		return "WEBHOOK", "Linear"
	case strings.Contains(lowerPath, "neon"):
		return "WEBHOOK", "Neon"
	case strings.Contains(lowerPath, "webhook"):
		return "WEBHOOK", ""
	default:
		return "REQUEST", ""
	}
}

func inferEventType(headers http.Header, payloadPreview string) string {
	candidates := []string{
		headers.Get("X-GitHub-Event"),
		headers.Get("X-Event-Type"),
		headers.Get("X-Webhook-Event"),
	}
	for _, candidate := range candidates {
		if strings.TrimSpace(candidate) != "" {
			return compactPreview(candidate, 120)
		}
	}

	if payloadPreview == "" {
		return ""
	}

	for _, key := range []string{`"type":"`, `"type": "`, `"event":"`, `"event": "`} {
		index := strings.Index(payloadPreview, key)
		if index == -1 {
			continue
		}
		rest := payloadPreview[index+len(key):]
		end := strings.IndexAny(rest, `",}`)
		if end == -1 {
			end = len(rest)
		}
		value := compactPreview(rest[:end], 120)
		if value != "" {
			return value
		}
	}

	return ""
}

func formatSource(remoteAddr string) string {
	if strings.TrimSpace(remoteAddr) == "" {
		return "public ingress"
	}
	return fmt.Sprintf("public ingress from %s", remoteAddr)
}

func formatHeadersForPreview(header http.Header) []string {
	if len(header) == 0 {
		return nil
	}

	keys := make([]string, 0, len(header))
	for key := range header {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	lines := make([]string, 0, min(len(keys), maxHeaderPreviewRows))
	for _, key := range keys {
		value := compactPreview(strings.Join(header.Values(key), ", "), 180)
		lines = append(lines, fmt.Sprintf("%s: %s", strings.ToLower(key), value))
		if len(lines) >= maxHeaderPreviewRows {
			break
		}
	}

	return lines
}

func compactPreview(input string, limit int) string {
	value := strings.TrimSpace(strings.Join(strings.Fields(input), " "))
	if value == "" {
		return ""
	}
	if len(value) <= limit {
		return value
	}
	return strings.TrimSpace(value[:limit]) + "..."
}

func joinPreviewSegments(values []string) string {
	filtered := make([]string, 0, len(values))
	for _, value := range values {
		if trimmed := strings.TrimSpace(value); trimmed != "" {
			filtered = append(filtered, trimmed)
		}
	}
	return strings.Join(filtered, " | ")
}

func splitPreviewLines(value string) []string {
	if strings.TrimSpace(value) == "" {
		return nil
	}

	lines := strings.Split(value, "\n")
	filtered := make([]string, 0, len(lines))
	for _, line := range lines {
		if trimmed := strings.TrimSpace(line); trimmed != "" {
			filtered = append(filtered, trimmed)
		}
	}
	return filtered
}

func classifyRequestError(status int, kind, responsePreview, fallback string) string {
	if status < 400 {
		return ""
	}

	lower := strings.ToLower(responsePreview + " " + fallback)
	switch {
	case status == http.StatusUnauthorized || status == http.StatusForbidden:
		return "AUTH_REJECTED"
	case status == http.StatusNotFound:
		return "ROUTE_NOT_FOUND"
	case strings.Contains(lower, "signature"):
		return "SIGNATURE_VERIFICATION_FAILED"
	case status == http.StatusUnprocessableEntity:
		return "PAYLOAD_REJECTED"
	case status == http.StatusBadGateway && strings.EqualFold(kind, "WEBHOOK"):
		return "WEBHOOK_UPSTREAM_BAD_GATEWAY"
	case status == http.StatusBadGateway:
		return "UPSTREAM_BAD_GATEWAY"
	case status == http.StatusServiceUnavailable:
		return "SERVICE_UNAVAILABLE"
	case status >= 500:
		return "UPSTREAM_SERVER_ERROR"
	default:
		return "REQUEST_REJECTED"
	}
}

func (s *Service) recordObservedRequest(tunnel TunnelRecord, observed requestObservation) error {
	record := RequestRecord{
		ID:              uuid.NewString(),
		TunnelID:        tunnel.ID,
		TunnelSubdomain: tunnel.Subdomain,
		Kind:            fallbackString(observed.Kind, "REQUEST"),
		Provider:        observed.Provider,
		EventType:       observed.EventType,
		Method:          observed.Method,
		Path:            observed.Path,
		Status:          observed.Status,
		DurationMs:      observed.DurationMs,
		Source:          observed.Source,
		Target:          observed.Target,
		Destination:     observed.Destination,
		ErrorType:       observed.ErrorType,
		RequestHeaders:  strings.Join(observed.RequestHeaders, "\n"),
		ResponseHeaders: strings.Join(observed.ResponseHeaders, "\n"),
		RequestPreview:  observed.RequestPreview,
		PayloadPreview:  observed.PayloadPreview,
		ResponsePreview: observed.ResponsePreview,
	}

	if err := s.db.Create(&record).Error; err != nil {
		return err
	}
	return s.pruneRequestRecords(s.storedRequestLimit())
}

func (s *Service) pruneEventRecords(limit int) error {
	if limit <= 0 {
		return nil
	}

	subQuery := s.db.Model(&EventRecord{}).
		Select("id").
		Order("created_at desc").
		Limit(-1).
		Offset(limit)

	return s.db.Where("id IN (?)", subQuery).Delete(&EventRecord{}).Error
}

func (s *Service) pruneRequestRecords(limit int) error {
	if limit <= 0 {
		return nil
	}

	subQuery := s.db.Model(&RequestRecord{}).
		Select("id").
		Order("created_at desc").
		Limit(-1).
		Offset(limit)

	return s.db.Where("id IN (?)", subQuery).Delete(&RequestRecord{}).Error
}

type statusCapturingResponseWriter struct {
	http.ResponseWriter
	status int
	body   bytes.Buffer
}

func newStatusCapturingResponseWriter(inner http.ResponseWriter) *statusCapturingResponseWriter {
	return &statusCapturingResponseWriter{
		ResponseWriter: inner,
		status:         http.StatusOK,
	}
}

func (w *statusCapturingResponseWriter) WriteHeader(status int) {
	w.status = status
	w.ResponseWriter.WriteHeader(status)
}

func (w *statusCapturingResponseWriter) Write(p []byte) (int, error) {
	if remaining := maxBodyPreviewBytes - w.body.Len(); remaining > 0 {
		if len(p) > remaining {
			w.body.Write(p[:remaining])
		} else {
			w.body.Write(p)
		}
	}
	return w.ResponseWriter.Write(p)
}

func (w *statusCapturingResponseWriter) Status() int {
	return w.status
}

func (w *statusCapturingResponseWriter) BodyPreview() string {
	return compactPreview(w.body.String(), maxBodyPreviewBytes)
}

func (w *statusCapturingResponseWriter) Flush() {
	if flusher, ok := w.ResponseWriter.(http.Flusher); ok {
		flusher.Flush()
	}
}

func (w *statusCapturingResponseWriter) Hijack() (net.Conn, *bufio.ReadWriter, error) {
	hijacker, ok := w.ResponseWriter.(http.Hijacker)
	if !ok {
		return nil, nil, errors.New("response writer does not support hijacking")
	}
	return hijacker.Hijack()
}

func (w *statusCapturingResponseWriter) Push(target string, opts *http.PushOptions) error {
	pusher, ok := w.ResponseWriter.(http.Pusher)
	if !ok {
		return http.ErrNotSupported
	}
	return pusher.Push(target, opts)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func formatTime(value *time.Time) string {
	if value == nil {
		return "Never"
	}
	return value.UTC().Format(time.RFC3339)
}
