package server

import (
	"net/http"
	"sync"
	"github.com/gorilla/websocket"
	
)

var upgrader = websocket.Upgrader{
	// CheckOrigin artık bool (true/false) dönecek şekilde güncellendi
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		// Eğer istek bizim Next.js dashboard'undan geliyorsa izin ver
		return origin == "http://localhost:3000"
		
		// NOT: Geliştirme aşamasında her şeye izin vermek istersen sadece:
		// return true 
		// yazabilirsin ama production'da (Miransas Prime zamanı) yukarıdaki gibi kalsın.
	},
}

// Clients: Bağlı olan tüm tarayıcıları tutan havuz
var (
	clients   = make(map[*websocket.Conn]bool)
	clientsMu sync.Mutex
)

// WsHandler: Dashboard'dan gelen bağlantıları kabul eder
func WsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}

	clientsMu.Lock()
	clients[conn] = true
	clientsMu.Unlock()

	// Bağlantı koptuğunda temizle
	defer func() {
		clientsMu.Lock()
		delete(clients, conn)
		clientsMu.Unlock()
		conn.Close()
	}()

	// Bağlantıyı açık tut
	for {
		if _, _, err := conn.NextReader(); err != nil {
			break
		}
	}
}

// BroadcastLog: Sunucunun herhangi bir yerinden log göndermek için kullanılır
func BroadcastLog(message string) {
	clientsMu.Lock()
	defer clientsMu.Unlock()

	for client := range clients {
		err := client.WriteMessage(websocket.TextMessage, []byte(message))
		if err != nil {
			client.Close()
			delete(clients, client)
		}
	}
}