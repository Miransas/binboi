package server

import (
	
	"net"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/miransas/binboi/internal/auth"
	"github.com/miransas/binboi/internal/db"
)

// Domain: UI tarafına gönderilecek alan adı yapısı
type Domain struct {
	Name        string `json:"name"`
	Type        string `json:"type"`
	Status      string `json:"status"`      // VERIFIED, PENDING
	ExpectedTXT string `json:"expected_txt"` // Kullanıcının DNS'e girmesi gereken değer
}

func RegisterAPI(r *gin.Engine) {
	// --- 1. WEBSOCKET LOG AKIŞI ---
	r.GET("/ws/logs", func(c *gin.Context) {
		WsHandler(c.Writer, c.Request)
	})

	api := r.Group("/api")
	{
		// [AUTH]: Token Yönetimi
		api.GET("/tokens/current", func(c *gin.Context) {
			userID := "user_asardor_1" // Mock ID
			
			// db paketindeki yeni fonksiyonumuz
			token, stats, err := db.GetUserTokenWithStats(c.Request.Context(), userID)
			if err != nil {
				c.JSON(http.StatusOK, gin.H{"token": "", "last_used_at": "NEVER", "active_nodes": 0})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"token":        token,
				"last_used_at": stats.LastUsed,
				"active_nodes": stats.ActiveCount,
			})
		})

		api.POST("/tokens/generate", func(c *gin.Context) {
			newKey := auth.GenerateNewKey()
			err := db.UpdateUserToken(c.Request.Context(), "user_asardor_1", newKey)
			if err != nil {
				c.JSON(500, gin.H{"error": "DATABASE_ERROR"})
				return
			}
			c.JSON(200, gin.H{"status": "SUCCESS", "token": newKey})
		})

		api.POST("/tokens/revoke", func(c *gin.Context) {
			// Tüm oturumları ve tokenı iptal et
			BroadcastLog("🚨 [SECURITY_PROTOCOL]: Manual revocation triggered. Closing all links.")
			err := db.RevokeAllSessions(c.Request.Context(), "user_asardor_1")
			if err != nil {
				c.JSON(500, gin.H{"error": "REVOKE_FAILED"})
				return
			}
			c.JSON(200, gin.H{"status": "ALL_SESSIONS_TERMINATED"})
		})

		// [DOMAINS]: Alan Adı Yönetimi
		api.GET("/domains", func(c *gin.Context) {
			domains := []Domain{
				{Name: "miransas.com", Type: "MANAGED", Status: "VERIFIED", ExpectedTXT: ""},
				{Name: "sazlab.dev", Type: "CUSTOM", Status: "PENDING", ExpectedTXT: "binboi-verification=9921-x11-cyber"},
			}
			c.JSON(http.StatusOK, domains)
		})

		api.POST("/domains/verify", func(c *gin.Context) {
			var req struct{ DomainName string `json:"domain_name"` }
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(400, gin.H{"error": "INVALID_REQ"})
				return
			}

			txtrecords, _ := net.LookupTXT(req.DomainName)
			verified := false
			for _, txt := range txtrecords {
				if strings.Contains(txt, "binboi-verification=") {
					verified = true
					break
				}
			}

			if verified {
				c.JSON(200, gin.H{"status": "SUCCESS"})
			} else {
				c.JSON(403, gin.H{"status": "FAILED"})
			}
		})

		// [TUNNELS]: Tünel Listesi
		api.GET("/tunnels", func(c *gin.Context) {
			c.JSON(http.StatusOK, []interface{}{}) 
		})
	}
}