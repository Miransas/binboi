package server

import (
	"log"
	"net/http"



	"elasiyanetwork/internal/auth"
	"elasiyanetwork/internal/tunnel"

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

    conn, _ := upgrader.Upgrade(w, r, nil)

    tunnel.Register(host, &tunnel.ClientTunnel{
        UserID: user,
        Conn:   conn,
    })

    log.Println("TUNNEL REGISTERED AS:", host)
}
