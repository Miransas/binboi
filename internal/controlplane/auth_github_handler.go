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

type authGithubRequest struct {
	GithubID  string `json:"github_id"`
	Login     string `json:"login"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url"`
}

func (s *Service) handleAuthGithub(c *gin.Context) {
	if s.cfg.JWTSecret == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "JWT not configured on this instance", "code": "JWT_UNCONFIGURED"})
		return
	}

	ap, ok := s.authProvider.(*authProvider)
	if !ok || !ap.Enabled() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "auth database not configured", "code": "AUTH_UNAVAILABLE"})
		return
	}

	var req authGithubRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body", "code": "INVALID_BODY"})
		return
	}
	if req.GithubID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "github_id is required", "code": "MISSING_GITHUB_ID"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 8*time.Second)
	defer cancel()

	// Look up existing linked oauth_account → user.
	var userID string
	oauthErr := ap.pool.QueryRow(ctx, `
		SELECT user_id FROM oauth_account
		WHERE provider = 'github' AND provider_account_id = $1
		LIMIT 1
	`, req.GithubID).Scan(&userID)

	if oauthErr != nil && !errors.Is(oauthErr, pgx.ErrNoRows) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}

	if errors.Is(oauthErr, pgx.ErrNoRows) {
		// No linked account — find by email or create a new user, then link.
		email := strings.ToLower(strings.TrimSpace(req.Email))
		name := strings.TrimSpace(req.Name)
		if name == "" {
			name = req.Login
		}
		now := time.Now().UTC()

		if email != "" {
			// Ignore scan error — if no row, userID stays empty.
			_ = ap.pool.QueryRow(ctx, `SELECT id FROM "user" WHERE email = $1 LIMIT 1`, email).Scan(&userID)
		}

		if userID == "" {
			userID = uuid.NewString()
			if _, err2 := ap.pool.Exec(ctx, `
				INSERT INTO "user"
				  (id, email, name, image, plan, is_active, "emailVerified", created_at, updated_at)
				VALUES ($1, $2, $3, $4, 'FREE', true, $5, $5, $5)
			`, userID, email, name, req.AvatarURL, now); err2 != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create account"})
				return
			}
		}

		if _, err2 := ap.pool.Exec(ctx, `
			INSERT INTO oauth_account (id, user_id, provider, provider_account_id, created_at)
			VALUES ($1, $2, 'github', $3, $4)
			ON CONFLICT (provider, provider_account_id) DO NOTHING
		`, uuid.NewString(), userID, req.GithubID, now); err2 != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not link account"})
			return
		}
	}

	// Fetch up-to-date user fields for the JWT.
	var (
		email    string
		name     string
		plan     string
		isActive bool
	)
	if err2 := ap.pool.QueryRow(ctx, `
		SELECT COALESCE(email,''), COALESCE(name,''), COALESCE(plan,'FREE'), COALESCE(is_active, true)
		FROM "user" WHERE id = $1 LIMIT 1
	`, userID).Scan(&email, &name, &plan, &isActive); err2 != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch user"})
		return
	}

	if !isActive {
		c.JSON(http.StatusForbidden, gin.H{"error": "this account is inactive", "code": "ACCOUNT_INACTIVE"})
		return
	}

	now := time.Now().UTC()
	token, err := auth.SignJWT(s.cfg.JWTSecret, auth.JWTClaims{
		Sub:   userID,
		Email: email,
		Name:  name,
		Plan:  strings.ToUpper(plan),
		IAT:   now.Unix(),
		EXP:   now.Add(jwtTokenTTL).Unix(),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not issue token"})
		return
	}

	c.JSON(http.StatusOK, authSuccessResponse{
		Token: token,
		User:  authUserPayload{ID: userID, Email: email, Name: name, Plan: strings.ToUpper(plan)},
	})
}
