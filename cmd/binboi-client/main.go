package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"net"
	"os"

	"github.com/hashicorp/yamux"
	"github.com/miransas/binboi/internal/config"
	"github.com/miransas/binboi/internal/protocol"
	"github.com/miransas/binboi/internal/server"
	
)

func main() {
	localPort := flag.Int("port", 3000, "Local port to expose")
	flag.Parse()

	// 1. Config'den Token Okunuyor
	token, err := config.LoadToken()
	if err != nil {
		fmt.Println("🔴 Authentication Required! Please run: binboi config add-authtoken <your-token>")
		os.Exit(1)
	}

	remoteAddr := "127.0.0.1:8080" // Test için local sunucuna bağlansın
	subdomain := "sazlab"

	conn, err := net.Dial("tcp", remoteAddr)
	if err != nil {
		fmt.Println("❌ Could not connect to server")
		os.Exit(1)
	}
	defer conn.Close()

	// 👉 İŞTE TOKEN HATASININ ÇÖZÜMÜ: Token değişkenini burada kullandık!
	hp := protocol.HandshakePayload{
		Subdomain: subdomain,
		LocalPort: *localPort,
		AuthToken: token, // Go artık "kullanılmadı" diye kızmayacak
	}
	
	payload, _ := json.Marshal(hp)
	msg, _ := (&protocol.Message{Type: protocol.TypeHandshake, Payload: payload}).Encode()
	conn.Write(msg)

	buf := make([]byte, 1024)
	n, _ := conn.Read(buf)
	raw, _ := protocol.Decode(buf[:n])

	var resp protocol.HandshakeResponse
	json.Unmarshal(raw.Payload, &resp)

	// Fallback URL (Eğer sunucu boş dönerse diye)
	if resp.URL == "" {
		resp.URL = fmt.Sprintf("https://%s.binboi.link", subdomain)
	}

	// 2. SHOWWELCOME HATASININ ÇÖZÜMÜ İÇİN AŞAĞIDAKİ KOMUTU KULLANACAĞIZ
	ShowWelcome(resp.URL, *localPort, "Sardor Azimov (Pro)", "eu-central")

	// Yamux Multiplexing...
	session, err := yamux.Client(conn, nil)
	if err != nil {
		return
	}

	for {
		stream, err := session.Accept()
		if err != nil {
			break
		}
		go func(s net.Conn) {
			defer s.Close()
			local, err := net.Dial("tcp", fmt.Sprintf("localhost:%d", *localPort))
			if err != nil {
				return
			}
			defer local.Close()
			server.Relay(s, local)
		}(stream)
	}
}