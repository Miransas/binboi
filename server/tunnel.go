package main

import (
	"encoding/json"
	"html/template"
	"io"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"elasiyanetwork/protocol"
)

type ClientHello struct {
	Name string `json:"name"`
}

type TunnelConn struct {
	ws        *websocket.Conn
	responses map[string]chan protocol.Response
	connectedAt time.Time
}

var (
	clients   = make(map[string]*TunnelConn)
	clientsMu sync.Mutex
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func handleClientConnect(w http.ResponseWriter, r *http.Request) {
	
	log.Println(">>> handleClientConnect HIT <<<")
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade error:", err)
		return
	}

	// HELLO
	_, msg, err := ws.ReadMessage()
	if err != nil {
		log.Println("hello read error:", err)
		ws.Close()
		return
	}

	var hello ClientHello
	if err := json.Unmarshal(msg, &hello); err != nil || hello.Name == "" {
		log.Println("invalid hello")
		ws.Close()
		return
	}

	conn := &TunnelConn{
		ws:        ws,
		responses: make(map[string]chan protocol.Response),
		connectedAt: time.Now(),
	}

	clientsMu.Lock()
	clients[hello.Name] = conn
	log.Println("Client registered:", hello.Name, "MAP SIZE:", len(clients))
	clientsMu.Unlock()

	defer func() {
		clientsMu.Lock()
		delete(clients, hello.Name)
		log.Println("Client disconnected:", hello.Name, "MAP SIZE:", len(clients))
		clientsMu.Unlock()
		ws.Close()
	}()

	// 🔒 BLOKLA
	for {
		_, msg, err := ws.ReadMessage()
		if err != nil {
			return
		}

		var res protocol.Response
		if err := json.Unmarshal(msg, &res); err != nil {
			continue
		}

		ch := conn.responses[res.ID]
		if ch != nil {
			ch <- res
		}
	}
}

func handleHTTP(w http.ResponseWriter, r *http.Request) {
	clientsMu.Lock()
	var conn *TunnelConn
	for _, c := range clients {
		conn = c
		break
	}
	clientsMu.Unlock()

	if conn == nil {
		http.Error(w, "NO CLIENT CONNECTED", 503)
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
	conn.responses[reqID] = ch

	conn.ws.WriteMessage(websocket.TextMessage, data)

	res := <-ch

	for k, v := range res.Header {
		w.Header().Set(k, v)
	}
	w.WriteHeader(res.StatusCode)
	w.Write(res.Body)
}

func handleDashboard(w http.ResponseWriter, r *http.Request) {
	type ClientView struct {
		Name        string
		ConnectedAt string
	}

	var list []ClientView

	clientsMu.Lock()
	for name, c := range clients {
		list = append(list, ClientView{
			Name:        name,
			ConnectedAt: c.connectedAt.Format("15:04:05"),
		})
	}
	clientsMu.Unlock()

	tmpl := `
<!doctype html>
<html>
<head>
	<title>Elasiyanetwork Dashboard</title>
	<style>
		body { font-family: sans-serif; background: #111; color: #eee; }
		table { border-collapse: collapse; margin-top: 20px; }
		td, th { padding: 8px 12px; border: 1px solid #333; }
		th { background: #222; }
	</style>
</head>
<body>
	<h1>🚇 Tunnel Dashboard</h1>
	<p>Connected clients: {{len .}}</p>

	<table>
	<tr>
		<th>Name</th>
		<th>Connected At</th>
	</tr>
	{{range .}}
	<tr>
		<td>{{.Name}}</td>
		<td>{{.ConnectedAt}}</td>
	</tr>
	{{end}}
	</table>
</body>
</html>
`
	t := template.Must(template.New("dash").Parse(tmpl))
	t.Execute(w, list)
}
