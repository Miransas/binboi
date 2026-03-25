package db

import (
	"context"
	"fmt"
	"os"
	"github.com/jackc/pgx/v5/pgxpool" 
)

var Pool *pgxpool.Pool

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