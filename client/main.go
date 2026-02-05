package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"

	"elasiyanetwork/protocol"

	"github.com/gorilla/websocket"
)

type ClientHello struct {
	Name string `json:"name"`
}

func main() {
	name := flag.String("name", "", "client name")
	port := flag.Int("port", 3000, "local port")
	flag.Parse()

	if *name == "" {
		log.Fatal("client name required: --name abc")
	}

	serverURL := url.URL{
	Scheme: "ws",
	Host:   "localhost:9090",
	Path:   "/connect",
}


	log.Println("Connecting to", serverURL.String())
	ws, _, err := websocket.DefaultDialer.Dial(serverURL.String(), nil)
	if err != nil {
		log.Fatal(err)
	}
	defer ws.Close()

	// 🔴 HELLO MUTLAKA BURADA GİDER
	hello := ClientHello{Name: *name}
	data, _ := json.Marshal(hello)
	ws.WriteMessage(websocket.TextMessage, data)

	log.Println("HELLO sent as:", string(data))

	// 🔒 LOOP
	for {
		_, msg, err := ws.ReadMessage()
		if err != nil {
			log.Println("server disconnected")
			return
		}

		var req protocol.Request
		if err := json.Unmarshal(msg, &req); err != nil {
			continue
		}

		url := "http://localhost:" + fmt.Sprint(*port) + req.Path
		httpReq, _ := http.NewRequest(req.Method, url, bytes.NewReader(req.Body))

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

		out, _ := json.Marshal(res)
		ws.WriteMessage(websocket.TextMessage, out)
	}
}
