package server

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

// CyberLogger: Binboi API trafiğini siberpunk renklerle loglar
func CyberLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// İstek başlangıcı
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method

		// İşlemi devam ettir (Route handler çalışsın)
		c.Next()

		// İstek sonu verileri
		latency := time.Since(start)
		status := c.Writer.Status()
		clientIP := c.ClientIP()

		// ANSI Renk Kodları
		reset := "\033[0m"
		magenta := "\033[35m"
		cyan := "\033[36m"
		white := "\033[97m"
		
		// Durum koduna göre renk seçimi
		statusColor := "\033[32m" // Yeşil (2xx)
		if status >= 300 {
			statusColor = "\033[33m" // Sarı (3xx)
		}
		if status >= 400 {
			statusColor = "\033[31m" // Kırmızı (4xx/5xx)
		}

		// Log Çıktısı: [BINBOI] 200 | GET | 1.5ms | 127.0.0.1 | /api/tunnels
		fmt.Printf("%s[BINBOI]%s %s%3d%s | %s%-7s%s | %s%10v%s | %s%-15s%s | %s%s%s\n",
			magenta, reset,
			statusColor, status, reset,
			cyan, method, reset,
			magenta, latency, reset,
			white, clientIP, reset,
			white, path, reset,
		)
	}
}