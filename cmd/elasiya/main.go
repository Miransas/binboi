package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"elasiyanetwork/protocol"

	"github.com/gorilla/websocket"
)

const version = "1.0.0"

var defaultServer = "ws://localhost:8080"

func main() {
	serverFlag := flag.String("server", envOrDefault("ELASIYA_SERVER", defaultServer), "Elasiya server WebSocket address")
	tokenFlag := flag.String("token", envOrDefault("ELASIYA_TOKEN", "ela_free_test"), "Auth token")
	hostFlag := flag.String("host", "", "Custom tunnel hostname (e.g. myapp.elasiya.network)")
	flag.Usage = printUsage
	flag.Parse()

	args := flag.Args()
	if len(args) == 0 {
		printUsage()
		os.Exit(1)
	}

	switch args[0] {
	case "http":
		if len(args) < 2 {
			fmt.Fprintln(os.Stderr, "Error: port required\n\nUsage: elasiya http <port>")
			os.Exit(1)
		}
		runHTTPTunnel(*serverFlag, *tokenFlag, *hostFlag, args[1])
	case "version":
		fmt.Printf("elasiya version %s\n", version)
	default:
		fmt.Fprintf(os.Stderr, "Unknown command: %s\n\n", args[0])
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Print(`elasiya - Expose local servers to the internet instantly

USAGE:
  elasiya [options] <command> [args]

COMMANDS:
  http <port>   Expose a local HTTP service on <port>
  version       Print version and exit

OPTIONS:
  --server string   Elasiya server address (default: ws://localhost:8080)
                    Override with ELASIYA_SERVER environment variable
  --token  string   Auth token (default: ela_free_test)
                    Override with ELASIYA_TOKEN environment variable
  --host   string   Custom tunnel hostname (optional)

EXAMPLES:
  elasiya http 3000
  elasiya http 8080 --token mytoken
  elasiya http 3000 --server ws://tunnel.elasiya.network

`)
}

func runHTTPTunnel(server, token, customHost, port string) {
	localAddr := "http://localhost:" + port

	host := customHost
	if host == "" {
		prefix := token
		if len(prefix) > 8 {
			prefix = prefix[:8]
		}
		host = "ela-" + prefix
	}

	wsURL := server + "/tunnel?host=" + host

	headers := http.Header{}
	headers.Set("Authorization", token)

	printBanner(server, host, port, localAddr)

	for {
		if err := connect(wsURL, headers, localAddr, host); err != nil {
			log.Printf("Connection lost: %v – reconnecting in 3s", err)
			time.Sleep(3 * time.Second)
		}
	}
}

func connect(wsURL string, headers http.Header, localAddr, host string) error {
	conn, _, err := websocket.DefaultDialer.Dial(wsURL, headers)
	if err != nil {
		return fmt.Errorf("dial: %w", err)
	}
	defer conn.Close()

	log.Printf("[elasiya] tunnel active  host=%s\n", host)

	for {
		var msg protocol.TunnelMessage
		if err := conn.ReadJSON(&msg); err != nil {
			return fmt.Errorf("read: %w", err)
		}

		if msg.Type != protocol.MsgRequest {
			continue
		}

		go handleRequest(conn, msg, localAddr)
	}
}

func handleRequest(conn *websocket.Conn, msg protocol.TunnelMessage, localAddr string) {
	target := localAddr + msg.Path
	req, err := http.NewRequest(msg.Method, target, bytes.NewReader(msg.Body))
	if err != nil {
		sendError(conn, msg.ID, 400)
		return
	}

	for k, v := range msg.Headers {
		req.Header.Set(k, v)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		sendError(conn, msg.ID, 502)
		logLine(msg.Method, 502, msg.Path)
		return
	}

	body, _ := io.ReadAll(resp.Body)
	resp.Body.Close()

	respHeaders := map[string]string{}
	for k, v := range resp.Header {
		if len(v) > 0 {
			respHeaders[k] = v[0]
		}
	}

	reply := protocol.TunnelMessage{
		ID:      msg.ID,
		Type:    protocol.MsgResponse,
		Status:  resp.StatusCode,
		Headers: respHeaders,
		Body:    body,
	}

	data, err := json.Marshal(reply)
	if err != nil {
		log.Println("marshal reply error:", err)
		return
	}
	if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
		log.Println("write reply error:", err)
		return
	}

	logLine(msg.Method, resp.StatusCode, msg.Path)
}

func sendError(conn *websocket.Conn, id string, status int) {
	reply := protocol.TunnelMessage{
		ID:     id,
		Type:   protocol.MsgResponse,
		Status: status,
	}
	data, err := json.Marshal(reply)
	if err != nil {
		log.Println("marshal error response:", err)
		return
	}
	if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
		log.Println("write error response:", err)
	}
}

func logLine(method string, status int, path string) {
	statusStr := fmt.Sprintf("%d", status)
	color := "\033[32m" // green
	if status >= 400 && status < 500 {
		color = "\033[33m" // yellow
	} else if status >= 500 {
		color = "\033[31m" // red
	}
	reset := "\033[0m"
	ts := time.Now().Format("15:04:05")
	fmt.Printf("%s  %-6s %s%s%s  %s\n", ts, method, color, statusStr, reset, path)
}

func printBanner(server, host, port, localAddr string) {
	wsServer := server
	displayURL := strings.Replace(wsServer, "ws://", "http://", 1)
	displayURL = strings.Replace(displayURL, "wss://", "https://", 1)

	fmt.Printf("\n")
	fmt.Printf("  🚇 Elasiya Tunnel  v%s\n", version)
	fmt.Printf("  ─────────────────────────────────────────\n")
	fmt.Printf("  Server   %s\n", server)
	fmt.Printf("  Tunnel   %s/%s  →  %s\n", displayURL, host, localAddr)
	fmt.Printf("  ─────────────────────────────────────────\n")
	fmt.Printf("  Press Ctrl+C to stop\n\n")
	fmt.Printf("  %-8s  %-6s  %s\n", "Time", "Status", "Path")
	fmt.Printf("  ─────────────────────────────────────────\n")
}

func envOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
