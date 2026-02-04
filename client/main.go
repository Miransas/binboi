package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"io"
	"log"
	"net/http"
	"net/url"
     "strconv"
	"github.com/gorilla/websocket"

	"elasiyanetwork/protocol"
)
const version = "0.1.0"

func main() {
	// ---- CLI FLAGS ----
	port := flag.Int(
		"port",
		3000,
		"Local server port to expose (default 3000)",
	)
	_ = flag.String(
	"name",
	"default",
	"Client name (for multi-client support)",
)

	showVersion := flag.Bool(
		"version",
		false,
		"Print version and exit",
	)

	flag.Parse()

	if *showVersion {
		log.Println("elasiyatunnel version", version)
		return
	}
	// -------------------

	serverURL := url.URL{
		Scheme: "ws",
		Host:   "localhost:8080",
		Path:   "/connect",
	}

	log.Println("===================================")
	log.Println(" Elasiyanetwork Tunnel Client")
	log.Println(" Exposing localhost on port:", *port)
	log.Println("===================================")

	log.Println("Connecting to server:", serverURL.String())

	ws, _, err := websocket.DefaultDialer.Dial(serverURL.String(), nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	log.Println("Connected to tunnel server")

	for {
		_, msg, err := ws.ReadMessage()
		if err != nil {
			log.Println("read error:", err)
			return
		}

		var req protocol.Request
		if err := json.Unmarshal(msg, &req); err != nil {
			continue
		}

		url := "http://localhost:" + strconv.Itoa(*port) + req.Path
		httpReq, _ := http.NewRequest(
			req.Method,
			url,
			bytes.NewReader(req.Body),
		)

		for k, v := range req.Header {
			httpReq.Header.Set(k, v)
		}

		resp, err := http.DefaultClient.Do(httpReq)
		if err != nil {
			continue
		}

		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		res := protocol.Response{
			ID:         req.ID,
			StatusCode: resp.StatusCode,
			Header:     map[string]string{},
			Body:       body,
		}

		for k, v := range resp.Header {
			if len(v) > 0 {
				res.Header[k] = v[0]
			}
		}

		data, _ := json.Marshal(res)
		ws.WriteMessage(websocket.TextMessage, data)
	}
}

