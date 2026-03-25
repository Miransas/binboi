package main

import (
	"context"
	"encoding/json"
	"strings"

	"fmt"
	"log"

	"net"
	"net/http"
	"net/http/httputil"

	"os"

	"sync"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/hashicorp/yamux"
	"github.com/jackc/pgx/v5/pgxpool"

	// auth paketini buraya ekledik
	"github.com/miransas/binboi/internal/cli"
	"github.com/miransas/binboi/internal/db"
	"github.com/miransas/binboi/internal/protocol"

	cors "github.com/rs/cors/wrapper/gin"
)

var (
	sessions = make(map[string]*yamux.Session)
	mu       sync.RWMutex
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
)

func main() {
	// 1. Önce Argüman Kontrolü (Panic önlemek için en üstte olmalı)
	if len(os.Args) > 1 && os.Args[1] == "auth" {
		if len(os.Args) < 3 {
			fmt.Println("❌ Usage: binboi auth <your_api_key>")
			return
		}
		key := os.Args[2]
		err := cli.SaveConfig(key)
		if err != nil {
			fmt.Println("🔴 Failed to save config:", err)
			return
		}
		fmt.Println("🚀 [NEURAL_LINK]: API Key secured.")
		return // CLI komutu biter, sunucu açılmaz
	}

	// 2. Database Bağlantısı
	ctx := context.Background()
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:password@localhost:5432/binboi"
	}

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Println("⚠️ DB connection failed, using mock mode:", err)
	}
	defer func() {
		if pool != nil {
			pool.Close()
		}
	}()

	tunnelStore := db.NewTunnelStore(pool)

	// 3. Proxy & TCP Sunucuları (Arka planda çalışırlar)
	go startProxyServer()
	go func() {
		l, _ := net.Listen("tcp", ":8081")
		for {
			conn, _ := l.Accept()
			go handleCli(conn, tunnelStore)
		}
	}()

	// 4. GIN API (Main thread)
	r := gin.Default()
	r.Use(cors.AllowAll())

	// WebSocket Log Hattı (Dashboard'un aradığı kapı)
	r.GET("/ws/logs", func(c *gin.Context) {
		ws, _ := upgrader.Upgrade(c.Writer, c.Request, nil)
		defer ws.Close()
		ws.WriteMessage(websocket.TextMessage, []byte("📡 [NEURAL_LINK]: Core established..."))
		for {
			if _, _, err := ws.ReadMessage(); err != nil {
				break
			}
		}
	})

	api := r.Group("/api")
	{
		// Tünel Listesi (Parametresiz - Dashboard ilk buraya gelir)
		api.GET("/tunnels", func(c *gin.Context) {
			c.JSON(200, []interface{}{}) // Şimdilik boş liste
		})

		api.GET("/tunnels/:user_id", func(c *gin.Context) {
			uid := c.Param("user_id")
			t, _ := tunnelStore.GetActiveTunnelsByUserID(c, uid)
			c.JSON(200, t)
		})

		// TOKEN ÜRETME (TokenManager'ın aradığı kapı)
		api.POST("/tokens/generate", func(c *gin.Context) {
			newKey := fmt.Sprintf("binboi_live_%s", uuid.New().String())
			// DB update mantığını buraya ekleyebilirsin
			c.JSON(200, gin.H{"status": "SUCCESS", "token": newKey})
		})

		api.POST("/tunnels", func(c *gin.Context) {
			var req db.Tunnel
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(400, gin.H{"error": "invalid"})
				return
			}
			req.ID = uuid.New().String()
			tunnelStore.CreateTunnel(c, &req)
			c.JSON(201, req)
		})
	}

	fmt.Println("🚀 Binboi Core Running on :8080")
	r.Run(":8080")
}

// ... handleCli ve startProxyServer fonksiyonları aynı kalabilir ...
// handleCli: CLI'dan gelen TCP bağlantısını karşılar ve tüneli açar
func handleCli(c net.Conn, store *db.TunnelStore) {
    defer c.Close()
    
    // 1. Handshake (El sıkışma) - CLI'dan gelen API Key ve Subdomain'i oku
    buf := make([]byte, 1024)
    n, err := c.Read(buf)
    if err != nil {
        return
    }

    raw, _ := protocol.Decode(buf[:n])
    var hp protocol.HandshakePayload
    json.Unmarshal(raw.Payload, &hp)

    // 2. Auth Kontrolü
    uid, err := store.ValidateApiKey(context.Background(), hp.AuthToken)
    if err != nil {
        fmt.Println("🔴 AUTH_FAILED: Invalid Token for", hp.Subdomain)
        return
    }

    // 3. Yamux Session Başlat (Çoklu akış için)
    session, err := yamux.Server(c, nil)
    if err != nil {
        return
    }

    mu.Lock()
    sessions[hp.Subdomain] = session
    mu.Unlock()

    // Dashboard için durumu güncelle
    store.UpdateTunnelStatus(context.Background(), hp.Subdomain, "ACTIVE")
    fmt.Printf("🟢 [TUNNEL_CONNECTED]: %s is now LIVE (User: %s)\n", hp.Subdomain, uid)

    // 4. Bağlantı kopana kadar bekle
    <-session.CloseChan()

    mu.Lock()
    delete(sessions, hp.Subdomain)
    mu.Unlock()
    
    store.UpdateTunnelStatus(context.Background(), hp.Subdomain, "INACTIVE")
    fmt.Printf("🔴 [TUNNEL_DISCONNECTED]: %s went offline\n", hp.Subdomain)
}

// startProxyServer: Dış dünyadan gelen HTTP isteklerini tünellere yönlendirir
func startProxyServer() {
    server := &http.Server{
        Addr: ":8000",
        Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Host'u parçala (asardor.binboi.link -> asardor)
            hostParts := strings.Split(r.Host, ".")
            subdomain := hostParts[0]

            mu.RLock()
            session, ok := sessions[subdomain]
            mu.RUnlock()

            if !ok {
                http.Error(w, "Neural Node Offline - Tünel Kapalı", http.StatusBadGateway)
                return
            }

            // Tünel üzerinden bir akış (stream) aç
            stream, err := session.Open()
            if err != nil {
                http.Error(w, "Tunnel Stream Error", http.StatusServiceUnavailable)
                return
            }
            defer stream.Close()

            // Reverse Proxy ayarı
            proxy := &httputil.ReverseProxy{
                Director: func(req *http.Request) {
                    req.URL.Scheme = "http"
                    req.URL.Host = r.Host
                },
                Transport: &http.Transport{
                    DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
                        return stream, nil
                    },
                },
            }
            proxy.ServeHTTP(w, r)
        }),
    }

    fmt.Println("📡 [PROXY_SERVER]: Neural Gateway listening on :8000")
    log.Fatal(server.ListenAndServe())
}