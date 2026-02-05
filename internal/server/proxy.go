package server

import (
	"io"
	"net/http"

	"elasiyanetwork/internal/tunnel"
	"elasiyanetwork/protocol"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

func ProxyHandler(w http.ResponseWriter, r *http.Request) {
	host := r.Host

	tun, ok := tunnel.Get(host)
	if !ok {
		http.Error(w, "no tunnel", 502)
		return
	}

	id := uuid.New().String()
	body, _ := io.ReadAll(r.Body)

	msg := protocol.TunnelMessage{
		ID:     id,
		Type:   protocol.MsgRequest,
		Method: r.Method,
		Path:   r.URL.Path,
		Body:   body,
	}

	// WS write
	tun.Conn.(*websocket.Conn).WriteJSON(msg)

	// (şimdilik blocking read – sonra async yaparız)
	var resp protocol.TunnelMessage
	tun.Conn.(*websocket.Conn).ReadJSON(&resp)

	w.WriteHeader(resp.Status)
	w.Write(resp.Body)
}
