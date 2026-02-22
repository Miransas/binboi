package server

import (
	"encoding/json"
	"log"
	"net/http"

	"elasiyanetwork/internal/auth"
	"elasiyanetwork/internal/tunnel"
	"elasiyanetwork/protocol"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func TunnelWS(w http.ResponseWriter, r *http.Request) {
	log.Println("WS CONNECT HIT")

	token := r.Header.Get("Authorization")
	user, err := auth.VerifyToken(token)
	if err != nil {
		log.Println("AUTH FAIL:", token)
		http.Error(w, "unauthorized", 401)
		return
	}

	host := r.URL.Query().Get("host")
	log.Println("REGISTER HOST:", host)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade error:", err)
		return
	}
	defer conn.Close()

	tun := &tunnel.ClientTunnel{
		UserID:    user,
		Conn:      conn,
		Responses: make(map[string]chan []byte),
	}

	tunnel.Register(host, tun)
	defer tunnel.Unregister(host)

	log.Println("TUNNEL REGISTERED AS:", host)

	// Keep reading responses from the client and dispatch to waiting channels.
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("client disconnected:", host)
			return
		}

		var resp protocol.TunnelMessage
		if err := json.Unmarshal(msg, &resp); err != nil {
			continue
		}

		tun.Mu.Lock()
		ch, ok := tun.Responses[resp.ID]
		tun.Mu.Unlock()
		if ok {
			select {
			case ch <- msg:
			default:
			}
		}
	}
}
