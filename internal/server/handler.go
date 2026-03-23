package server

import (
	"encoding/json"
	"fmt"
	"io"
	"net"

	"github.com/hashicorp/yamux"
	"github.com/miransas/binboi/internal/auth"
	"github.com/miransas/binboi/internal/db"
	"github.com/miransas/binboi/internal/models"
	"github.com/miransas/binboi/internal/protocol"
)

// HandleClient is the entry point for every new incoming tunnel connection
func HandleClient(conn net.Conn) {
	buffer := make([]byte, 2048)
	n, err := conn.Read(buffer)
	if err != nil {
		fmt.Printf("❌ Failed to read handshake: %v\n", err)
		conn.Close()
		return
	}

	// 1. Decode the initial protocol message
	msg, err := protocol.Decode(buffer[:n])
	if err != nil || msg.Type != protocol.TypeHandshake {
		sendError(conn, "Invalid protocol handshake")
		return
	}

	var hp protocol.HandshakePayload
	if err := json.Unmarshal(msg.Payload, &hp); err != nil {
		sendError(conn, "Malformed handshake payload")
		return
	}

	// 2. Security Check: Hash the incoming token and verify against Database
	incomingHash := auth.HashToken(hp.Token)
	var user models.User
	if err := db.DB.Where("token = ?", incomingHash).First(&user).Error; err != nil {
		sendError(conn, "Authentication failed: Invalid Miransas Token")
		return
	}

	// 3. Subdomain Ownership Logic
	var existingTunnel models.Tunnel
	err = db.DB.Where("subdomain = ?", hp.Subdomain).First(&existingTunnel).Error

	if err == nil {
		// Subdomain exists, check if it belongs to THIS user
		if existingTunnel.UserID != user.ID {
			sendError(conn, "Permission denied: Subdomain is already owned by another user")
			return
		}
	} else {
		// New subdomain! Reserve it for this user permanently in the database
		newTunnel := models.Tunnel{
			UserID:    user.ID,
			Subdomain: hp.Subdomain,
			LocalPort: hp.LocalPort,
			IsOnline:  true,
		}
		if err := db.DB.Create(&newTunnel).Error; err != nil {
			sendError(conn, "Database error while reserving subdomain")
			return
		}
	}

	// 4. Upgrade connection to Yamux Multiplexing session
	mux, err := yamux.Server(conn, nil)
	if err != nil {
		fmt.Printf("❌ Failed to initialize Yamux: %v\n", err)
		conn.Close()
		return
	}

	// 5. Register active session in memory for the HTTP Router
	mu.Lock()
	Sessions[hp.Subdomain] = &Session{
		Conn:      conn,
		Mux:       mux,
		Subdomain: hp.Subdomain,
	}
	mu.Unlock()

	// 6. Send Handshake Success ACK back to Client
	resp := protocol.HandshakeResponse{
		Status: "success",
		URL:    fmt.Sprintf("%s.binboi.link", hp.Subdomain),
	}
	payload, _ := json.Marshal(resp)
	ack, _ := (&protocol.Message{Type: protocol.TypeHandshakeAck, Payload: payload}).Encode()
	conn.Write(ack)

	fmt.Printf("🚀 [SERVER] Tunnel active: %s -> User: %s\n", hp.Subdomain, user.Username)
}

// sendError helper sends a protocol-level error message and closes the connection
func sendError(conn net.Conn, reason string) {
	resp := protocol.HandshakeResponse{
		Status:  "error",
		Message: reason,
	}
	payload, _ := json.Marshal(resp)
	errMsg, _ := (&protocol.Message{Type: protocol.TypeError, Payload: payload}).Encode()
	conn.Write(errMsg)
	conn.Close()
}

// Relay performs bidirectional data transfer between two connections with error handling
func Relay(src, dst net.Conn) {
	defer src.Close()
	defer dst.Close()

	errChan := make(chan error, 2)

	// Pipe from Source to Destination
	go func() {
		_, err := io.Copy(src, dst)
		errChan <- err
	}()

	// Pipe from Destination back to Source
	go func() {
		_, err := io.Copy(dst, src)
		errChan <- err
	}()

	// Wait for any side to close or fail
	<-errChan
}