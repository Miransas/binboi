package main


import (
	"log"
	"net/url"

	"github.com/gorilla/websocket"
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
		log.Fatal("connection failed:", err)
	}
	defer ws.Close()

	log.Println("Connected to tunnel server")

	// Şimdilik sadece bağlantıyı açık tut
	select {}
}