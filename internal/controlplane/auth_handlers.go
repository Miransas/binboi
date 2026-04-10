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
	"golang.org/x/crypto/bcrypt"
)

const jwtTokenTTL = 7 * 24 * time.Hour

// ── request / response types ──────────────────────────────────────────────────

type authRegisterRequest struct {
	Name            string `json:"name"`
	Email           string `json:"email"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirm_password"`
}

type authLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authUserPayload struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Plan  string `json:"plan"`
}

type authSuccessResponse struct {
	Token string          `json:"token"`
	User  authUserPayload `json:"user"`
}

// ── handlers ──────────────────────────────────────────────────────────────────

func (s *Service) handleAuthRegister(c *gin.Context) {
	if s.cfg.JWTSecret == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "JWT not configured on this instance", "code": "JWT_UNCONFIGURED"})
		return
	}

	ap, ok := s.authProvider.(*authProvider)
	if !ok || !ap.Enabled() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "auth database not configured", "code": "AUTH_UNAVAILABLE"})
		return
	}

	var req authRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body", "code": "INVALID_BODY"})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	name := strings.TrimSpace(req.Name)
	password := req.Password

	switch {
	case email == "":
		c.JSON(http.StatusBadRequest, gin.H{"error": "email is required", "code": "MISSING_EMAIL"})
		return
	case password == "":
		c.JSON(http.StatusBadRequest, gin.H{"error": "password is required", "code": "MISSING_PASSWORD"})
		return
	case len(password) < 8:
		c.JSON(http.StatusBadRequest, gin.H{"error": "password must be at least 8 characters", "code": "PASSWORD_TOO_SHORT"})
		return
	case req.ConfirmPassword != "" && password != req.ConfirmPassword:
		c.JSON(http.StatusBadRequest, gin.H{"error": "passwords do not match", "code": "PASSWORD_MISMATCH"})
		return
	}

	if name == "" {
		if at := strings.IndexByte(email, '@'); at > 0 {
			name = email[:at]
		} else {
			name = email
		}
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 8*time.Second)
	defer cancel()

	// Conflict check
	var existingID string
	err := ap.pool.QueryRow(ctx, `SELECT id FROM "user" WHERE email = $1 LIMIT 1`, email).Scan(&existingID)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "an account with this email already exists", "code": "ACCOUNT_EXISTS"})
		return
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create account"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create account"})
		return
	}

	userID := uuid.NewString()
	now := time.Now().UTC()

	_, err = ap.pool.Exec(ctx, `
		INSERT INTO "user"
		  (id, email, name, password_hash, plan, is_active, "emailVerified", created_at, updated_at)
		VALUES ($1, $2, $3, $4, 'FREE', true, $5, $5, $5)
	`, userID, email, name, string(hash), now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create account"})
		return
	}

	token, err := auth.SignJWT(s.cfg.JWTSecret, auth.JWTClaims{
		Sub:   userID,
		Email: email,
		Name:  name,
		Plan:  "FREE",
		IAT:   now.Unix(),
		EXP:   now.Add(jwtTokenTTL).Unix(),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not issue token"})
		return
	}

	c.JSON(http.StatusCreated, authSuccessResponse{
		Token: token,
		User:  authUserPayload{ID: userID, Email: email, Name: name, Plan: "FREE"},
	})
}

func (s *Service) handleAuthLogin(c *gin.Context) {
	if s.cfg.JWTSecret == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "JWT not configured on this instance", "code": "JWT_UNCONFIGURED"})
		return
	}

	ap, ok := s.authProvider.(*authProvider)
	if !ok || !ap.Enabled() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "auth database not configured", "code": "AUTH_UNAVAILABLE"})
		return
	}

	var req authLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body", "code": "INVALID_BODY"})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email is required", "code": "MISSING_EMAIL"})
		return
	}
	if req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password is required", "code": "MISSING_PASSWORD"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 8*time.Second)
	defer cancel()

	var (
		userID       string
		name         string
		passwordHash string
		plan         string
		isActive     bool
	)

	err := ap.pool.QueryRow(ctx, `
		SELECT id, COALESCE(name,''), COALESCE(password_hash,''), COALESCE(plan,'FREE'), COALESCE(is_active, true)
		FROM "user"
		WHERE email = $1
		LIMIT 1
	`, email).Scan(&userID, &name, &passwordHash, &plan, &isActive)

	if errors.Is(err, pgx.ErrNoRows) || (err == nil && passwordHash == "") {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "the email or password you entered is incorrect", "code": "INVALID_CREDENTIALS"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not sign in"})
		return
	}
	if !isActive {
		c.JSON(http.StatusForbidden, gin.H{"error": "this account is inactive", "code": "ACCOUNT_INACTIVE"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "the email or password you entered is incorrect", "code": "INVALID_CREDENTIALS"})
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
