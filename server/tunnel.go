
package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type TunnelConn struct {
	ws *websocket.Conn
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func handleClientConnect(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade error:", err)
		return
	}

	mu.Lock()
	clientConn = &TunnelConn{ws: ws}
	mu.Unlock()

	log.Println("Client connected")
}
func handleHTTP(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	conn := clientConn
	mu.Unlock()

	if conn == nil {
		http.Error(w, "no client connected", 503)
		return
	}

	// ŞİMDİLİK SADECE TEST
	w.Write([]byte("Connected to tunnel server"))
}

