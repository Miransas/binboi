package server

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/miransas/binboi/internal/auth"
	"github.com/miransas/binboi/internal/db"
)

func RegisterAPI(r *gin.Engine) {
	// 1. WebSocket Kapısı (En üstte, ana dizinde kalsın)
	r.GET("/ws/logs", func(c *gin.Context) {
		WsHandler(c.Writer, c.Request)
	})

	api := r.Group("/api")
	{
		// Tünel Listesi (Dashboard bunu parametresiz çağırıyor)
		api.GET("/tunnels", func(c *gin.Context) {
			c.JSON(http.StatusOK, []interface{}{}) // Şimdilik boş liste
		})

		// Token Oluşturma
		api.POST("/tokens/generate", func(c *gin.Context) {
			newKey := auth.GenerateNewKey()
			err := db.UpdateUserToken(c.Request.Context(), "user_asardor_1", newKey)
			if err != nil {
				c.JSON(500, gin.H{"error": "DATABASE_ERROR"})
				return
			}
			c.JSON(200, gin.H{"token": newKey})
		})

		// Test Logu (Dashboard'a veri göndermek için)
		api.POST("/test-log", func(c *gin.Context) {
			BroadcastLog("📡 [NEURAL_SIGNAL]: Manual ping from dashboard.")
			c.JSON(200, gin.H{"status": "SENT"})
		})
	}
}