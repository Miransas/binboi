package main

import (
	"encoding/json"
	"fmt"
	"net"
	"github.com/hashicorp/yamux"
	"github.com/miransas/binboi/internal/protocol"
	"github.com/miransas/binboi/internal/server"
	"github.com/charmbracelet/lipgloss"
)

func main() {
	// Client Config (Later move to config.yaml)
	remoteAddr := "your-server-ip:8080"
	localPort := 3000
	subdomain := "sazlab"

	conn, err := net.Dial("tcp", remoteAddr)
	if err != nil {
		fmt.Println("❌ Could not connect to binboi server")
		return
	}

	// 1. Handshake
	hp := protocol.HandshakePayload{Subdomain: subdomain, LocalPort: localPort}
	payload, _ := json.Marshal(hp)
	msg, _ := (&protocol.Message{Type: protocol.TypeHandshake, Payload: payload}).Encode()
	conn.Write(msg)

	// 2. Wait for Ack
	buf := make([]byte, 1024)
	n, _ := conn.Read(buf)
	raw, _ := protocol.Decode(buf[:n])
	var resp protocol.HandshakeResponse
	json.Unmarshal(raw.Payload, &resp)

	// 3. UI Presentation
	renderUI(resp.URL, localPort)

	// 4. Start Multiplexing
	session, _ := yamux.Client(conn, nil)
	for {
		stream, err := session.Accept()
		if err != nil {
			break
		}
		go func(s net.Conn) {
			local, _ := net.Dial("tcp", fmt.Sprintf("localhost:%d", localPort))
			server.Relay(s, local)
		}(stream)
	}
}

func renderUI(url string, port int) {
	style := lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).Padding(1, 4).BorderForeground(lipgloss.Color("#00FFD1"))
	fmt.Println(style.Render(fmt.Sprintf("✨ MIRANSAS BINBOI ONLINE\n\n🔗 %s -> localhost:%d", url, port)))
}