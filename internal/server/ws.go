package server

import (
	"net/http"

	"github.com/gorilla/websocket"
	"elasiyanetwork/internal/auth"
	"elasiyanetwork/internal/tunnel"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func TunnelWS(w http.ResponseWriter, r *http.Request) {
	token := r.Header.Get("Authorization")
	user, err := auth.VerifyToken(token)
	if err != nil {
		http.Error(w, "unauthorized", 401)
		return
	}

	host := r.URL.Query().Get("host")
	if host == "" {
		http.Error(w, "host required", 400)
		return
	}

	conn, _ := upgrader.Upgrade(w, r, nil)

	tunnel.Register(host, &tunnel.ClientTunnel{
		UserID: user,
		Conn:   conn,
	})
}
