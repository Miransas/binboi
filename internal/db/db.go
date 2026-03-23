package db


import (
	"github.com/miransas/binboi/internal/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDB initializes the database and performs auto-migration
func InitDB() {
	var err error
	// Using SQLite for local development (no server needed)
	// Later change to postgres.Open(dsn) for production
	DB, err = gorm.Open(sqlite.Open("binboi.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Automatically create/update tables based on our models
	DB.AutoMigrate(&models.User{}, &models.Tunnel{})
}