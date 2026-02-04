package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"elasiyanetwork/protocol"
)

type TunnelConn struct {
	ws        *websocket.Conn
	responses map[string]chan protocol.Response
}
type ClientHello struct {
	Name string `json:"name"`
}


var (
	clientConn *TunnelConn
	mu         sync.Mutex
)

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
	clientConn = &TunnelConn{
		ws:        ws,
		responses: make(map[string]chan protocol.Response),
	}
	mu.Unlock()

	log.Println("Client connected")

	go listenClient(ws)
	_, msg, err := ws.ReadMessage()
if err != nil {
	log.Println("failed to read hello:", err)
	return
}

var hello ClientHello
if err := json.Unmarshal(msg, &hello); err != nil {
	log.Println("invalid hello:", err)
	return
}

log.Println("Client connected with name:", hello.Name)

}

func listenClient(ws *websocket.Conn) {
	for {
		_, msg, err := ws.ReadMessage()
		if err != nil {
			log.Println("client disconnected")
			return
		}

		var res protocol.Response
		if err := json.Unmarshal(msg, &res); err != nil {
			continue
		}

		mu.Lock()
		ch := clientConn.responses[res.ID]
		mu.Unlock()

		if ch != nil {
			ch <- res
		}
	}
}

func handleHTTP(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	conn := clientConn
	mu.Unlock()

	if conn == nil {
		http.Error(w, "no client connected", 503)
		return
	}

	body, _ := io.ReadAll(r.Body)

	headers := map[string]string{}
	for k, v := range r.Header {
		if len(v) > 0 {
			headers[k] = v[0]
		}
	}

	reqID := uuid.NewString()

	req := protocol.Request{
		ID:     reqID,
		Method: r.Method,
		Path:   r.URL.Path,
		Header: headers,
		Body:   body,
	}

	data, _ := json.Marshal(req)

	ch := make(chan protocol.Response)
	mu.Lock()
	conn.responses[reqID] = ch
	mu.Unlock()

	conn.ws.WriteMessage(websocket.TextMessage, data)

	res := <-ch

	for k, v := range res.Header {
		w.Header().Set(k, v)
	}
	w.WriteHeader(res.StatusCode)
	w.Write(res.Body)
}