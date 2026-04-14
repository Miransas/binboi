package controlplane

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/miransas/binboi/internal/auth"
)

type AuthIdentity struct {
	UserID      string
	Name        string
	Email       string
	Plan        string
	TokenPrefix string
	AuthMode    string
}

type accessAuthenticator interface {
	Enabled() bool
	Mode() string
	ValidateAccessToken(context.Context, string) (*AuthIdentity, error)
	LookupUserPlan(context.Context, string) (string, error)
	HealthCheck(context.Context) error
	Close() error
}

type authProvider struct {
	pool *pgxpool.Pool
}

func newAuthProvider(databaseURL string) (*authProvider, error) {
	if strings.TrimSpace(databaseURL) == "" {
		return &authProvider{}, nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, fmt.Errorf("connect auth database: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping auth database: %w", err)
	}

	ap := &authProvider{pool: pool}

	migrateCtx, migrateCancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer migrateCancel()
	if err := ap.migrateSchema(migrateCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("migrate auth schema: %w", err)
	}

	return ap, nil
}

// migrateSchema creates the auth tables if they don't already exist.
// All statements are idempotent (IF NOT EXISTS / IF column does not exist).
func (p *authProvider) migrateSchema(ctx context.Context) error {
	statements := []string{
		// ── users ──────────────────────────────────────────────────────────────
		`CREATE TABLE IF NOT EXISTS "user" (
			id               text        PRIMARY KEY,
			name             text,
			email            text        NOT NULL,
			"emailVerified"  timestamp,
			image            text,
			password_hash    text,
			plan             text        NOT NULL DEFAULT 'FREE',
			is_active        boolean              DEFAULT true,
			paddle_customer_id text,
			created_at       timestamp   NOT NULL DEFAULT now(),
			updated_at       timestamp   NOT NULL DEFAULT now(),
			CONSTRAINT user_email_unique             UNIQUE (email),
			CONSTRAINT user_paddle_customer_id_unique UNIQUE (paddle_customer_id)
		)`,

		// ── access tokens ──────────────────────────────────────────────────────
		`CREATE TABLE IF NOT EXISTS access_token (
			id           text      PRIMARY KEY,
			user_id      text      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			name         text      NOT NULL,
			prefix       text      NOT NULL,
			token_hash   text      NOT NULL,
			status       text      NOT NULL DEFAULT 'ACTIVE',
			last_used_at timestamp,
			revoked_at   timestamp,
			created_at   timestamp NOT NULL DEFAULT now(),
			CONSTRAINT access_token_prefix_unique UNIQUE (prefix)
		)`,

		// ── billing subscriptions ──────────────────────────────────────────────
		`CREATE TABLE IF NOT EXISTS billing_subscriptions (
			id                       serial    PRIMARY KEY,
			user_id                  text      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			provider                 text      NOT NULL DEFAULT 'PADDLE',
			plan                     text      NOT NULL DEFAULT 'FREE',
			status                   text      NOT NULL DEFAULT 'FREE',
			paddle_subscription_id   text,
			paddle_customer_id       text,
			paddle_price_id          text,
			renews_at                timestamp,
			cancel_at_period_end     boolean   NOT NULL DEFAULT false,
			created_at               timestamp NOT NULL DEFAULT now(),
			updated_at               timestamp NOT NULL DEFAULT now(),
			CONSTRAINT billing_subscriptions_paddle_subscription_id_unique UNIQUE (paddle_subscription_id)
		)`,

		// ── oauth accounts ─────────────────────────────────────────────────────
		`CREATE TABLE IF NOT EXISTS oauth_account (
			id                   text      PRIMARY KEY,
			user_id              text      NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			provider             text      NOT NULL,
			provider_account_id  text      NOT NULL,
			created_at           timestamp NOT NULL DEFAULT now(),
			CONSTRAINT oauth_account_provider_unique UNIQUE (provider, provider_account_id)
		)`,

		// ── indexes ────────────────────────────────────────────────────────────
		`CREATE INDEX IF NOT EXISTS access_token_user_id_idx          ON access_token          (user_id)`,
		`CREATE INDEX IF NOT EXISTS billing_subscriptions_user_id_idx  ON billing_subscriptions (user_id)`,
		`CREATE INDEX IF NOT EXISTS oauth_account_user_id_idx          ON oauth_account          (user_id)`,
	}

	for _, stmt := range statements {
		if _, err := p.pool.Exec(ctx, stmt); err != nil {
			return fmt.Errorf("exec migration: %w\nstatement: %s", err, stmt[:min(80, len(stmt))])
		}
	}
	return nil
}


func (p *authProvider) Enabled() bool {
	return p != nil && p.pool != nil
}

func (p *authProvider) Mode() string {
	if p.Enabled() {
		return "personal-access-token"
	}
	return "instance-token-preview"
}

func (p *authProvider) ValidateAccessToken(ctx context.Context, raw string) (*AuthIdentity, error) {
	if !p.Enabled() {
		return nil, errors.New("auth database not configured")
	}

	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil, errors.New("missing token")
	}

	prefix, err := auth.ExtractAccessTokenPrefix(raw)
	if err != nil {
		return nil, err
	}

	var (
		identity  AuthIdentity
		tokenHash string
		status    string
		isActive  bool
		revokedAt *time.Time
	)

	err = p.pool.QueryRow(ctx, `
		SELECT
			at.user_id,
			COALESCE(u.name, ''),
			COALESCE(u.email, ''),
			COALESCE(u.plan, 'FREE'),
			at.token_hash,
			COALESCE(at.status, 'ACTIVE'),
			COALESCE(u.is_active, true),
			at.revoked_at
		FROM access_token at
		INNER JOIN "user" u ON u.id = at.user_id
		WHERE at.prefix = $1
		LIMIT 1
	`, prefix).Scan(
		&identity.UserID,
		&identity.Name,
		&identity.Email,
		&identity.Plan,
		&tokenHash,
		&status,
		&isActive,
		&revokedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("invalid access token")
		}
		return nil, fmt.Errorf("query access token: %w", err)
	}

	if !isActive {
		return nil, errors.New("account is inactive")
	}
	if strings.ToUpper(status) != "ACTIVE" || revokedAt != nil {
		return nil, errors.New("access token has been revoked")
	}
	if !auth.CheckToken(raw, tokenHash) {
		return nil, errors.New("invalid access token")
	}

	now := time.Now().UTC()
	if _, err := p.pool.Exec(ctx, `UPDATE access_token SET last_used_at = $1 WHERE prefix = $2`, now, prefix); err != nil {
		return nil, fmt.Errorf("update token usage: %w", err)
	}

	identity.Plan = strings.ToUpper(strings.TrimSpace(identity.Plan))
	if identity.Plan == "" {
		identity.Plan = "FREE"
	}
	identity.TokenPrefix = prefix
	identity.AuthMode = p.Mode()
	return &identity, nil
}

func (p *authProvider) LookupUserPlan(ctx context.Context, userID string) (string, error) {
	if !p.Enabled() {
		return "", errors.New("auth database not configured")
	}

	userID = strings.TrimSpace(userID)
	if userID == "" {
		return "", errors.New("missing user id")
	}

	var plan string
	err := p.pool.QueryRow(ctx, `
		SELECT COALESCE(plan, 'FREE')
		FROM "user"
		WHERE id = $1
		LIMIT 1
	`, userID).Scan(&plan)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "FREE", nil
		}
		return "", fmt.Errorf("query user plan: %w", err)
	}

	plan = strings.ToUpper(strings.TrimSpace(plan))
	if plan == "" {
		plan = "FREE"
	}
	return plan, nil
}

func (p *authProvider) HealthCheck(ctx context.Context) error {
	if !p.Enabled() {
		return nil
	}
	return p.pool.Ping(ctx)
}

func (p *authProvider) Close() error {
	if p == nil || p.pool == nil {
		return nil
	}
	p.pool.Close()
	p.pool = nil
	return nil
}
