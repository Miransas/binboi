package db

import (
	"context"
	
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Tunnel struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Subdomain string    `json:"subdomain"`
	Target    string    `json:"target"`
	Status    string    `json:"status"` // ACTIVE, INACTIVE
	Region    string    `json:"region"`
	CreatedAt time.Time `json:"created_at"`
}

type TunnelStore struct {
	pool *pgxpool.Pool
}

func NewTunnelStore(pool *pgxpool.Pool) *TunnelStore {
	return &TunnelStore{pool: pool}
}

// 1. ValidateApiKey - Auth Hatasını Çözer
func (s *TunnelStore) ValidateApiKey(ctx context.Context, apiKey string) (string, error) {
	var userID string
	query := `SELECT id FROM users WHERE api_key = $1 LIMIT 1`
	err := s.pool.QueryRow(ctx, query, apiKey).Scan(&userID)
	return userID, err
}

// 2. IsSubdomainTaken - Çakışma Hatasını Çözer
func (s *TunnelStore) IsSubdomainTaken(ctx context.Context, subdomain string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM tunnels WHERE subdomain = $1)`
	err := s.pool.QueryRow(ctx, query, subdomain).Scan(&exists)
	return exists, err
}

// 3. CreateTunnel - CreateTunnel undefined Hatasını Çözer
func (s *TunnelStore) CreateTunnel(ctx context.Context, t *Tunnel) error {
	query := `INSERT INTO tunnels (id, user_id, subdomain, target, status, region, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())`
	_, err := s.pool.Exec(ctx, query, t.ID, t.UserID, t.Subdomain, t.Target, t.Status, t.Region)
	return err
}

// 4. UpdateTunnelStatus - UpdateTunnelStatus undefined Hatasını Çözer
func (s *TunnelStore) UpdateTunnelStatus(ctx context.Context, subdomain string, status string) error {
	_, err := s.pool.Exec(ctx, "UPDATE tunnels SET status = $1 WHERE subdomain = $2", status, subdomain)
	return err
}

// 5. GetActiveTunnelsByUserID - Listeleme Hatasını Çözer
func (s *TunnelStore) GetActiveTunnelsByUserID(ctx context.Context, userID string) ([]Tunnel, error) {
	query := `SELECT id, user_id, subdomain, target, status, region, created_at FROM tunnels WHERE user_id = $1`
	rows, err := s.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var tunnels []Tunnel
	for rows.Next() {
		var t Tunnel
		rows.Scan(&t.ID, &t.UserID, &t.Subdomain, &t.Target, &t.Status, &t.Region, &t.CreatedAt)
		tunnels = append(tunnels, t)
	}
	return tunnels, nil
}

