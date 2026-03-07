package main

import (
	"bytes"
	
	"io"
	"log"
	"net/http"
	

	"github.com/gorilla/websocket"
	"github.com/Miransas/binboi/protocol"
)

func main() {
	// --- CONFIG ---
    serverWS := "ws://localhost:8080/tunnel?host=local.elasiya"





	token := "ela_free_test"
	localAddr := "http://localhost:3000"

	headers := http.Header{}
	headers.Set("Authorization", token)

	// --- CONNECT WS ---
	conn, _, err := websocket.DefaultDialer.Dial(serverWS, headers)
	if err != nil {
		log.Fatal("WS connect error:", err)
	}
	defer conn.Close()

	log.Println("Connected to Elasiya server")

	for {
		var msg protocol.TunnelMessage
		if err := conn.ReadJSON(&msg); err != nil {
			log.Println("read error:", err)
			return
		}

		if msg.Type != protocol.MsgRequest {
			continue
		}

		// --- FORWARD TO LOCAL ---
		req, err := http.NewRequest(
			msg.Method,
			localAddr+msg.Path,
			bytes.NewReader(msg.Body),
		)
		if err != nil {
			log.Println("request error:", err)
			continue
		}

		for k, v := range msg.Headers {
			req.Header.Set(k, v)
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			log.Println("local forward error:", err)
			continue
		}

		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		// --- SEND BACK ---
		reply := protocol.TunnelMessage{
			ID:     msg.ID,
			Type:   protocol.MsgResponse,
			Status: resp.StatusCode,
			Body:   body,
		}

		if err := conn.WriteJSON(reply); err != nil {
			log.Println("write error:", err)
			return
		}
	}
}
