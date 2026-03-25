package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net"
	"net/http"
	"net/http/httputil"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/hashicorp/yamux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/miransas/binboi/internal/cli"
	"github.com/miransas/binboi/internal/db"
	"github.com/miransas/binboi/internal/protocol"
	cors "github.com/rs/cors/wrapper/gin"
)

var (
	sessions = make(map[string]*yamux.Session)
	mu       sync.RWMutex
)

func main() {
	ctx := context.Background()
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:password@localhost:5432/binboi"
	}

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	tunnelStore := db.NewTunnelStore(pool)

	// PROXY SERVER
	go startProxyServer()

	// GIN API
	r := gin.Default()
	r.Use(cors.AllowAll())
	
	api := r.Group("/api")
	{
		api.GET("/tunnels/:user_id", func(c *gin.Context) {
			uid := c.Param("user_id") // uid burada KULLANILDI
			t, _ := tunnelStore.GetActiveTunnelsByUserID(c, uid)
			c.JSON(200, t)
		})

		api.POST("/tunnels", func(c *gin.Context) {
			var req db.Tunnel
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(400, gin.H{"error": "invalid"})
				return
			}
			req.ID = uuid.New().String()
			tunnelStore.CreateTunnel(c, &req) // CreateTunnel artık tanımlı!
			c.JSON(201, req)
		})
	}

	// TUNNEL TCP SERVER
	go func() {
		l, _ := net.Listen("tcp", ":8081")
		for {
			conn, _ := l.Accept()
			go handleCli(conn, tunnelStore)
		}
	}()

	fmt.Println("🚀 Binboi Core Running...")
	r.Run(":8080")
	// ... (main fonksiyonu içinde)
if os.Args[1] == "auth" {
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

    fmt.Println("🚀 [NEURAL_LINK]: API Key secured. You are ready to tunnel.")
}
}

func handleCli(c net.Conn, store *db.TunnelStore) {
	buf := make([]byte, 1024)
	_, _ = c.Read(buf) // 'n' hatasını çözmek için _ kullandık
	
	raw, _ := protocol.Decode(buf)
	var hp protocol.HandshakePayload
	json.Unmarshal(raw.Payload, &hp)

	uid, err := store.ValidateApiKey(context.Background(), hp.AuthToken)
	if err != nil {
		fmt.Println("Auth failed for:", uid) // uid burada KULLANILDI
		c.Close()
		return
	}

	session, _ := yamux.Server(c, nil)
	mu.Lock()
	sessions[hp.Subdomain] = session
	mu.Unlock()
	store.UpdateTunnelStatus(context.Background(), hp.Subdomain, "ACTIVE")

	resp, _ := json.Marshal(protocol.HandshakeResponse{Status: "success"})
	ack, _ := (&protocol.Message{Type: protocol.TypeHandshakeAck, Payload: resp}).Encode()
	_, _ = c.Write(ack) // resp burada dolaylı olarak KULLANILDI

	<-session.CloseChan()
	mu.Lock()
	delete(sessions, hp.Subdomain)
	mu.Unlock()
	store.UpdateTunnelStatus(context.Background(), hp.Subdomain, "INACTIVE")
}

func startProxyServer() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		sub := strings.Split(r.Host, ".")[0]
		mu.RLock()
		session, ok := sessions[sub]
		mu.RUnlock()

		if !ok {
			http.Error(w, "offline", 502)
			return
		}

		stream, _ := session.Open()
		proxy := &httputil.ReverseProxy{
			Director: func(req *http.Request) {
				req.URL.Scheme, req.URL.Host = "http", r.Host
			},
			Transport: &http.Transport{
				DialContext: func(ctx context.Context, n, a string) (net.Conn, error) { return stream, nil },
			},
		}
		proxy.ServeHTTP(w, r)
	})
	http.ListenAndServe(":8000", nil)
}

// Stripe Checkout Session Oluşturma
func CreateCheckoutSession(c *gin.Context) {
	// Stripe SDK ile session oluştur...
	// Kullanıcıyı Stripe ödeme sayfasına yönlendir.
}

// Stripe Webhook (Ödeme başarılı olduğunda tetiklenir)
func HandleStripeWebhook(pool *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Stripe'dan gelen event'i doğrula
		// 2. Eğer "checkout.session.completed" ise:
		// UPDATE users SET plan_type = 'pro' WHERE id = user_id;
		c.JSON(200, gin.H{"status": "success"})
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func handleStatsWS(c *gin.Context) {
	ws, _ := upgrader.Upgrade(c.Writer, c.Request, nil)
	defer ws.Close()

	for {
		// Tüm tünellerin anlık throughput verisini topla
		stats := make(map[string]int64)
		mu.RLock()
		for sub, _ := range sessions {
			// Burada son 1 saniyede geçen byte miktarını hesapla
			stats[sub] = rand.Int63n(1000) // DEMO: Gerçekte RelayWithCounter'dan gelir
		}
		mu.RUnlock()

		if err := ws.WriteJSON(stats); err != nil {
			break
		}
		time.Sleep(1 * time.Second) // Saniyede 1 güncelleme gönder
	}
}

// Gin Router içine ekle:
// r.GET("/ws/stats", handleStatsWS)


func HandleGenericPayment(c *gin.Context) {
    // Burası Lemon Squeezy veya başka bir servisin çağıracağı yer
    var payload struct {
        Email string `json:"customer_email"`
        Status string `json:"status"`
    }
    
    if err := c.ShouldBindJSON(&payload); err == nil && payload.Status == "paid" {
        // DB'de kullanıcıyı yükselt
        // tunnelStore.UpgradeToPro(context.Background(), payload.Email)
        c.JSON(200, gin.H{"message": "Welcome to Pro, Operator."})
    }
}