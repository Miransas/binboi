package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/url"

	"github.com/gorilla/websocket"

	"elasiyanetwork/protocol"
)

func main() {
	serverURL := url.URL{
		Scheme: "ws",
		Host:   "localhost:8080",
		Path:   "/connect",
	}

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

		url := "http://localhost:3000" + req.Path
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
