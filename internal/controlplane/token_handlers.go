package controlplane

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/miransas/binboi/internal/auth"
)

// ── plan limits ───────────────────────────────────────────────────────────────

var patPlanLimits = map[string]int{
	"FREE":  3,
	"PRO":   25,
	"SCALE": 100,
}

func maxTokensForPlan(plan string) int {
	if n, ok := patPlanLimits[strings.ToUpper(plan)]; ok {
		return n
	}
	return patPlanLimits["FREE"]
}

// ── JWT middleware ────────────────────────────────────────────────────────────

const jwtClaimsKey = "binboi.jwt_claims"

// requireJWT validates the Bearer JWT produced by /api/auth/login or /api/auth/register.
// It is intentionally separate from requireControlPlaneAccess (which validates PATs).
func (s *Service) requireJWT() gin.HandlerFunc {
	return func(c *gin.Context) {
		if s.cfg.JWTSecret == "" {
			c.AbortWithStatusJSON(http.StatusServiceUnavailable, gin.H{
				"error": "JWT not configured on this instance",
				"code":  "JWT_UNCONFIGURED",
			})
			return
		}

		raw := extractBearerToken(c.Request)
		if raw == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "authentication required",
				"code":  "MISSING_TOKEN",
			})
			return
		}

		claims, err := auth.VerifyJWT(s.cfg.JWTSecret, raw)
		if err != nil {
			status := http.StatusUnauthorized
			code := "INVALID_TOKEN"
			if errors.Is(err, auth.ErrTokenExpired) {
				code = "TOKEN_EXPIRED"
			}
			c.AbortWithStatusJSON(status, gin.H{"error": err.Error(), "code": code})
			return
		}

		c.Set(jwtClaimsKey, claims)
		c.Next()
	}
}

func jwtClaimsFromCtx(c *gin.Context) *auth.JWTClaims {
	v, _ := c.Get(jwtClaimsKey)
	claims, _ := v.(*auth.JWTClaims)
	return claims
}

// ── response types ────────────────────────────────────────────────────────────

type patRecord struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Prefix     string  `json:"prefix"`
	Status     string  `json:"status"`
	CreatedAt  string  `json:"createdAt"`
	LastUsedAt *string `json:"lastUsedAt"`
	RevokedAt  *string `json:"revokedAt"`
}

type patUser struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Plan  string `json:"plan"`
}

type patLimits struct {
	Plan          string `json:"plan"`
	MaxTokens     int    `json:"max_tokens"`
	MaxTunnels    int    `json:"max_tunnels"`
	TokensUsed    int    `json:"tokens_used"`
	ActiveTunnels *int   `json:"active_tunnels"`
}

type patListResponse struct {
	AuthMode string      `json:"auth_mode"`
	User     patUser     `json:"user"`
	Limits   patLimits   `json:"limits"`
	Tokens   []patRecord `json:"tokens"`
}

type patCreateResponse struct {
	AuthMode string      `json:"auth_mode"`
	User     patUser     `json:"user"`
	Limits   patLimits   `json:"limits"`
	Token    string      `json:"token"`
	Record   patRecord   `json:"record"`
}

// ── helpers ───────────────────────────────────────────────────────────────────

func formatTimePtr(t *time.Time) *string {
	if t == nil {
		return nil
	}
	s := t.UTC().Format(time.RFC3339)
	return &s
}

func (s *Service) loadUserTokens(ctx context.Context, ap *authProvider, userID string) ([]patRecord, error) {
	rows, err := ap.pool.Query(ctx, `
		SELECT id, name, prefix, COALESCE(status,'ACTIVE'), created_at, last_used_at, revoked_at
		FROM access_token
		WHERE user_id = $1
		ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []patRecord
	for rows.Next() {
		var (
			r          patRecord
			createdAt  time.Time
			lastUsedAt *time.Time
			revokedAt  *time.Time
		)
		if err := rows.Scan(&r.ID, &r.Name, &r.Prefix, &r.Status, &createdAt, &lastUsedAt, &revokedAt); err != nil {
			return nil, err
		}
		r.CreatedAt = createdAt.UTC().Format(time.RFC3339)
		r.LastUsedAt = formatTimePtr(lastUsedAt)
		r.RevokedAt = formatTimePtr(revokedAt)
		records = append(records, r)
	}
	if records == nil {
		records = []patRecord{}
	}
	return records, rows.Err()
}

func buildPatLimits(plan string, tokens []patRecord) patLimits {
	p := strings.ToUpper(plan)
	maxTokens := maxTokensForPlan(p)
	maxTunnels := 1
	if p == "PRO" {
		maxTunnels = 25
	} else if p == "SCALE" {
		maxTunnels = 100
	}
	active := 0
	for _, t := range tokens {
		if t.Status == "ACTIVE" {
			active++
		}
	}
	return patLimits{
		Plan:          p,
		MaxTokens:     maxTokens,
		MaxTunnels:    maxTunnels,
		TokensUsed:    active,
		ActiveTunnels: nil,
	}
}

// ── GET /api/v1/tokens ────────────────────────────────────────────────────────

func (s *Service) handleV1ListTokens(c *gin.Context) {
	claims := jwtClaimsFromCtx(c)
	if claims == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing claims"})
		return
	}

	ap, ok := s.authProvider.(*authProvider)
	if !ok || !ap.Enabled() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "auth database not configured", "code": "AUTH_UNAVAILABLE"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 8*time.Second)
	defer cancel()

	tokens, err := s.loadUserTokens(ctx, ap, claims.Sub)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load tokens"})
		return
	}

	plan := strings.ToUpper(claims.Plan)
	c.JSON(http.StatusOK, patListResponse{
		AuthMode: "account",
		User:     patUser{ID: claims.Sub, Name: claims.Name, Email: claims.Email, Plan: plan},
		Limits:   buildPatLimits(plan, tokens),
		Tokens:   tokens,
	})
}

// ── POST /api/v1/tokens ───────────────────────────────────────────────────────

func (s *Service) handleV1CreateToken(c *gin.Context) {
	claims := jwtClaimsFromCtx(c)
	if claims == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing claims"})
		return
	}

	ap, ok := s.authProvider.(*authProvider)
	if !ok || !ap.Enabled() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "auth database not configured", "code": "AUTH_UNAVAILABLE"})
		return
	}

	var req struct {
		Name string `json:"name"`
	}
	_ = c.ShouldBindJSON(&req)
	name := strings.TrimSpace(req.Name)
	if name == "" {
		name = "CLI token"
	}
	if len(name) > 64 {
		name = name[:64]
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 8*time.Second)
	defer cancel()

	// Enforce plan limit
	existing, err := s.loadUserTokens(ctx, ap, claims.Sub)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not check token limit"})
		return
	}
	plan := strings.ToUpper(claims.Plan)
	limits := buildPatLimits(plan, existing)
	if limits.TokensUsed >= limits.MaxTokens {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "token limit reached for your plan",
			"code":  "TOKEN_LIMIT_REACHED",
		})
		return
	}

	// Generate and insert (retry on prefix collision)
	var fullToken, prefix string
	var tokenID string
	var createdAt time.Time

	for attempt := 0; attempt < 3; attempt++ {
		var genErr error
		fullToken, prefix, genErr = auth.GenerateAccessToken()
		if genErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not generate token"})
			return
		}
		tokenHash := auth.HashToken(fullToken)
		tokenID = uuid.NewString()
		createdAt = time.Now().UTC()

		_, insertErr := ap.pool.Exec(ctx, `
			INSERT INTO access_token (id, user_id, name, prefix, token_hash, status, created_at)
			VALUES ($1, $2, $3, $4, $5, 'ACTIVE', $6)
		`, tokenID, claims.Sub, name, prefix, tokenHash, createdAt)

		if insertErr == nil {
			break
		}
		// unique violation on prefix — retry
		if attempt == 2 {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create token"})
			return
		}
	}

	record := patRecord{
		ID:         tokenID,
		Name:       name,
		Prefix:     prefix,
		Status:     "ACTIVE",
		CreatedAt:  createdAt.Format(time.RFC3339),
		LastUsedAt: nil,
		RevokedAt:  nil,
	}

	allTokens := append(existing, record)
	c.JSON(http.StatusCreated, patCreateResponse{
		AuthMode: "account",
		User:     patUser{ID: claims.Sub, Name: claims.Name, Email: claims.Email, Plan: plan},
		Limits:   buildPatLimits(plan, allTokens),
		Token:    fullToken,
		Record:   record,
	})
}

// ── DELETE /api/v1/tokens/:id ─────────────────────────────────────────────────

func (s *Service) handleV1DeleteToken(c *gin.Context) {
	claims := jwtClaimsFromCtx(c)
	if claims == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing claims"})
		return
	}

	ap, ok := s.authProvider.(*authProvider)
	if !ok || !ap.Enabled() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "auth database not configured", "code": "AUTH_UNAVAILABLE"})
		return
	}

	tokenID := strings.TrimSpace(c.Param("id"))
	if tokenID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing token id"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 8*time.Second)
	defer cancel()

	// Verify ownership
	var ownerID string
	err := ap.pool.QueryRow(ctx, `
		SELECT user_id FROM access_token WHERE id = $1 LIMIT 1
	`, tokenID).Scan(&ownerID)
	if errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusNotFound, gin.H{"error": "token not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load token"})
		return
	}
	if ownerID != claims.Sub {
		c.JSON(http.StatusNotFound, gin.H{"error": "token not found"})
		return
	}

	now := time.Now().UTC()
	_, err = ap.pool.Exec(ctx, `
		UPDATE access_token SET status = 'REVOKED', revoked_at = $1 WHERE id = $2
	`, now, tokenID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not revoke token"})
		return
	}

	// Return updated list
	tokens, err := s.loadUserTokens(ctx, ap, claims.Sub)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load tokens"})
		return
	}

	plan := strings.ToUpper(claims.Plan)
	c.JSON(http.StatusOK, patListResponse{
		AuthMode: "account",
		User:     patUser{ID: claims.Sub, Name: claims.Name, Email: claims.Email, Plan: plan},
		Limits:   buildPatLimits(plan, tokens),
		Tokens:   tokens,
	})
}
