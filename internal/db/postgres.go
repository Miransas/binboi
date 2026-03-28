package db

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool
type TokenStats struct {
	LastUsed    string
	ActiveCount int
}

func ConnectDB() {
	// Sunucuyu aldığımızda buraya Neon/Postgres URL'ini koyacağız
	connStr := os.Getenv("DATABASE_URL") 
	if connStr == "" {
		connStr = "postgres://admin:password@localhost:5432/binboi"
	}

	var err error
	Pool, err = pgxpool.New(context.Background(), connStr)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to connect to database: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("🐘 [DATABASE]: Neural Link established with Postgres.")
}

// UpdateUserToken: Verilen kullanıcının API key'ini günceller
func UpdateUserToken(ctx context.Context, userID string, newKey string) error {
	// Senin DB bağlantı değişkenin (örn: Pool veya Conn) neyse onu kullan
	query := `UPDATE users SET api_key = $1 WHERE id = $2`
	_, err := Pool.Exec(ctx, query, newKey, userID) // Pool'un büyük harf olması kritik
	return err
}
func GetUserTokenWithStats(ctx context.Context, userID string) (string, TokenStats, error) {
	// Burası ilerde veritabanından (Postgres) çekecek
	// Şimdilik mock veri dönüyoruz ki derleyici sussun
	return "binboi_live_asardor_x77", TokenStats{
		LastUsed:    time.Now().Format("2006-01-02 15:04:05"),
		ActiveCount: 2,
	}, nil
}

// RevokeAllSessions: Kullanıcının tüm erişimini sıfırlar
func RevokeAllSessions(ctx context.Context, userID string) error {
	// DB'de tokenı temizle ve aktif tünelleri silme mantığı buraya gelecek
	return nil
}