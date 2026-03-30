package cli

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"os"

	"github.com/hashicorp/yamux"
	"github.com/miransas/binboi/internal/protocol"
)

func StartHttpTunnel(token string, port int, subdomain string) error {
	serverAddr := os.Getenv("BINBOI_SERVER_ADDR")
	if serverAddr == "" {
		serverAddr = "127.0.0.1:8081"
	}

	conn, err := net.Dial("tcp", serverAddr)
	if err != nil {
		return fmt.Errorf("connect to relay: %w", err)
	}

	hp := protocol.HandshakePayload{
		AuthToken: token,
		Subdomain: subdomain,
		LocalPort: port,
		ClientVersion: "0.3.0",
	}
	payload, _ := json.Marshal(hp)
	msg, _ := (&protocol.Message{Type: protocol.TypeHandshake, Payload: payload}).Encode()
	if _, err := conn.Write(msg); err != nil {
		return fmt.Errorf("send handshake: %w", err)
	}

	buf := make([]byte, 1024)
	n, err := conn.Read(buf)
	if err != nil {
		return fmt.Errorf("read handshake response: %w", err)
	}

	raw, err := protocol.Decode(buf[:n])
	if err != nil {
		return fmt.Errorf("decode handshake response: %w", err)
	}

	var resp protocol.HandshakeResponse
	if err := json.Unmarshal(raw.Payload, &resp); err != nil {
		return fmt.Errorf("parse handshake response: %w", err)
	}

	if resp.Status != "success" {
		if resp.Message == "" {
			resp.Message = "relay rejected the connection"
		}
		return errors.New(resp.Message)
	}

	RenderCoolUI(subdomain, resp.URL, port)

	session, err := yamux.Client(conn, nil)
	if err != nil {
		return fmt.Errorf("create yamux client: %w", err)
	}

	for {
		stream, err := session.Accept()
		if err != nil {
			return err
		}

		go func(s net.Conn) {
			local, err := net.Dial("tcp", fmt.Sprintf("127.0.0.1:%d", port))
			if err != nil {
				s.Close()
				return
			}
			joinConnections(s, local)
		}(stream)
	}
}

func joinConnections(left, right net.Conn) {
	defer left.Close()
	defer right.Close()

	done := make(chan struct{}, 2)

	go func() {
		_, _ = io.Copy(left, right)
		done <- struct{}{}
	}()

	go func() {
		_, _ = io.Copy(right, left)
		done <- struct{}{}
	}()

	<-done
}
