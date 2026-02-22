package server

import (
	"encoding/json"
	"io"
	"log"
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
		http.Error(w, "no tunnel for "+host, 502)
		return
	}

	id := uuid.New().String()
	body, _ := io.ReadAll(r.Body)

	headers := map[string]string{}
	for k, v := range r.Header {
		if len(v) > 0 {
			headers[k] = v[0]
		}
	}

	msg := protocol.TunnelMessage{
		ID:      id,
		Type:    protocol.MsgRequest,
		Method:  r.Method,
		Path:    r.URL.RequestURI(),
		Headers: headers,
		Body:    body,
	}

	ch := make(chan []byte, 1)
	tun.Mu.Lock()
	tun.Responses[id] = ch
	tun.Mu.Unlock()

	defer func() {
		tun.Mu.Lock()
		delete(tun.Responses, id)
		tun.Mu.Unlock()
	}()

	if err := tun.Conn.(*websocket.Conn).WriteJSON(msg); err != nil {
		log.Println("write to tunnel error:", err)
		http.Error(w, "tunnel write error", 502)
		return
	}

	rawResp := <-ch

	var resp protocol.TunnelMessage
	if err := json.Unmarshal(rawResp, &resp); err != nil {
		log.Println("response parse error:", err)
		http.Error(w, "bad response", 502)
		return
	}

	for k, v := range resp.Headers {
		w.Header().Set(k, v)
	}
	w.WriteHeader(resp.Status)
	w.Write(resp.Body)
}
