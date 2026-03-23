package server

import (
	"encoding/json"
	"fmt"
	"io"
	"net"

	"github.com/hashicorp/yamux"
	"github.com/miransas/binboi/internal/protocol"
)

// Define a valid token (In production, load this from config.yaml)
const ValidToken = "miransas-secret-2026"

func HandleClient(conn net.Conn) {
	buffer := make([]byte, 2048)
	n, err := conn.Read(buffer)
	if err != nil {
		conn.Close()
		return
	}

	msg, err := protocol.Decode(buffer[:n])
	if err != nil || msg.Type != protocol.TypeHandshake {
		conn.Close()
		return
	}

	var hp protocol.HandshakePayload
	json.Unmarshal(msg.Payload, &hp)

	// 🔒 Security Check: Validate Token
	if hp.Token != ValidToken {
		fmt.Printf("⚠️  [AUTH] Unauthorized access attempt from: %s\n", conn.RemoteAddr())
		resp := protocol.HandshakeResponse{
			Status:  "error",
			Message: "Invalid authentication token",
		}
		payload, _ := json.Marshal(resp)
		errData, _ := (&protocol.Message{Type: protocol.TypeError, Payload: payload}).Encode()
		conn.Write(errData)
		conn.Close()
		return
	}

	// Initialize Yamux Server
	mux, err := yamux.Server(conn, nil)
	if err != nil {
		conn.Close()
		return
	}

	mu.Lock()
	Sessions[hp.Subdomain] = &Session{
		Conn:      conn,
		Mux:       mux,
		Subdomain: hp.Subdomain,
	}
	mu.Unlock()

	// Send Success ACK
	resp := protocol.HandshakeResponse{
		Status: "success",
		URL:    fmt.Sprintf("%s.binboi.link", hp.Subdomain),
	}
	payload, _ := json.Marshal(resp)
	ack, _ := (&protocol.Message{Type: protocol.TypeHandshakeAck, Payload: payload}).Encode()
	conn.Write(ack)

	fmt.Printf("🚀 [SERVER] Authorized tunnel established: %s\n", hp.Subdomain)
}

// Relay handles robust bidirectional data transfer
func Relay(src, dst net.Conn) {
	// Ensure both connections are closed when the transfer ends
	defer src.Close()
	defer dst.Close()

	// Error channel to catch issues during copying
	errChan := make(chan error, 2)

	// Start copying from client to server (e.g., Request)
	go func() {
		_, err := io.Copy(src, dst)
		errChan <- err
	}()

	// Start copying from server back to client (e.g., Response)
	go func() {
		_, err := io.Copy(dst, src)
		errChan <- err
	}()

	// Wait for the first error or completion
	err := <-errChan
	if err != nil && err != io.EOF {
		// Log error professionally (we can add a real logger later)
		fmt.Printf("⚠️  Relay connection closed: %v\n", err)
	}
}
