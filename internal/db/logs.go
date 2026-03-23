package db

import "github.com/miransas/binboi/internal/models"

// LogActivity saves a connection event to the database
func LogActivity(userID uint, subdomain, ip, action string) {
	log := models.ActivityLog{
		UserID:    userID,
		Subdomain: subdomain,
		IPAddress: ip,
		Action:    action,
	}
	DB.Create(&log)
}