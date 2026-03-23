package models

import (
	"time"
	"gorm.io/gorm"
)

// User represents a Miransas account holder
type User struct {
	gorm.Model
	Username string `gorm:"uniqueIndex;not null"`
	Email    string `gorm:"uniqueIndex;not null"`
	Token    string `gorm:"uniqueIndex;not null"` // Hashed auth token
	IsActive bool   `gorm:"default:true"`
	Tunnels  []Tunnel
}

// Tunnel represents a mapping between a subdomain and a local port
type Tunnel struct {
	gorm.Model
	UserID       uint
	Subdomain    string    `gorm:"uniqueIndex;not null"` // e.g. "sazlab"
	LocalPort    int       `gorm:"not null"`            // e.g. 3000
	RemoteAddr   string    // The public IP of the client
	LastActiveAt time.Time
	IsOnline     bool      `gorm:"default:false"`
}

type ActivityLog struct {
	gorm.Model
	UserID    uint
	Subdomain string
	IPAddress string
	Action    string // e.g., "CONNECTED", "DISCONNECTED"
}