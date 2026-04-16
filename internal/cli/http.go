package cli

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net"
	"strings"

	"github.com/hashicorp/yamux"
	"github.com/miransas/binboi/internal/protocol"
)

func StartHttpTunnel(token string, port int, subdomain string) error {
	serverAddr := ResolveServerAddr("")
	apiURL := APIBaseURL()

	// ── startup diagnostics (printed once, before the live UI) ───────────────
	fmt.Printf("→ Relay server : %s\n", serverAddr)
	fmt.Printf("→ API endpoint : %s\n", apiURL)
	tokenPrefix := token
	if len(token) > 8 {
		tokenPrefix = token[:8] + "..."
	}
	fmt.Printf("→ Token        : %s\n", tokenPrefix)
	fmt.Printf("→ Local port   : %d\n", port)
	if subdomain != "" {
		fmt.Printf("→ Subdomain    : %s\n", subdomain)
	}
	fmt.Println()

	// ── TCP connect ───────────────────────────────────────────────────────────
	fmt.Printf("Connecting to relay at %s ...\n", serverAddr)
	conn, err := net.Dial("tcp", serverAddr)
	if err != nil {
		fmt.Println()
		fmt.Println("Tip: check BINBOI_SERVER_ADDR or that the relay is reachable.")
		return fmt.Errorf("connect to relay: %w", err)
	}
	fmt.Println("TCP connection established. Sending handshake ...")

	// ── handshake ─────────────────────────────────────────────────────────────
	hp := protocol.HandshakePayload{
		AuthToken:     token,
		Subdomain:     subdomain,
		LocalPort:     port,
		ClientVersion: Version,
	}
	payload, _ := json.Marshal(hp)
	msg, _ := (&protocol.Message{Type: protocol.TypeHandshake, Payload: payload}).Encode()
	if _, err := conn.Write(msg); err != nil {
		return fmt.Errorf("send handshake: %w", err)
	}

	fmt.Println("Waiting for handshake response ...")
	buf := make([]byte, 1024)
	n, err := conn.Read(buf)
	if err != nil {
		fmt.Println()
		fmt.Println("Tip: relay closed the connection before responding — check server logs.")
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
		fmt.Println()
		fmt.Println("Tip: verify your token is valid — run: binboi whoami")
		return errors.New(resp.Message)
	}

	fmt.Println("Handshake OK. Starting live dashboard ...\n")

	// ── stats + background workers ────────────────────────────────────────────
	stats := NewTunnelStats()
	stopCh := make(chan struct{})
	defer close(stopCh)

	go measurePing(serverAddr, stats, stopCh)
	go RunLiveUI(stats, UIOptions{
		Subdomain:  subdomain,
		URL:        resp.URL,
		Port:       port,
		ServerAddr: serverAddr,
	}, stopCh)

	// ── yamux multiplexed session ─────────────────────────────────────────────
	session, err := yamux.Client(conn, nil)
	if err != nil {
		return fmt.Errorf("create yamux client: %w", err)
	}

	for {
		stream, err := session.Accept()
		if err != nil {
			if strings.Contains(err.Error(), "session shutdown") || errors.Is(err, io.EOF) {
				return fmt.Errorf("tunnel closed by relay: %w", err)
			}
			return fmt.Errorf("tunnel accept error: %w", err)
		}

		go func(s net.Conn) {
			local, err := net.Dial("tcp", fmt.Sprintf("127.0.0.1:%d", port))
			if err != nil {
				// Increment error counter so the live UI reflects it.
				stats.Errors.Add(1)
				s.Close()
				return
			}
			proxyHTTP(s, local, stats)
		}(stream)
	}
}
