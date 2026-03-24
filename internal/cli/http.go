package cli

import (
	"encoding/json"
	"fmt"
	"net"

	"github.com/hashicorp/yamux"
	"github.com/miransas/binboi/internal/client"
	"github.com/miransas/binboi/internal/protocol"
	"github.com/miransas/binboi/internal/server"
)

func StartHttpTunnel(token string, port int, subdomain string) {
	// Sunucu IP'sini kendi VPS IP'n ile değiştirmeyi unutma usta!
	conn, err := net.Dial("tcp", "your-server-ip:8081")
	if err != nil {
		fmt.Println("❌ Server connection failed:", err)
		return
	}

	// 1. Handshake (El Sıkışma) Paketini Gönder
	hp := protocol.HandshakePayload{
		AuthToken: token, 
		Subdomain: subdomain, 
		LocalPort: port,
	}
	payload, _ := json.Marshal(hp)
	msg, _ := (&protocol.Message{Type: protocol.TypeHandshake, Payload: payload}).Encode()
	_, _ = conn.Write(msg) // 'n' hatasını önlemek için _ kullandık

	// 2. Sunucudan Gelen Onayı Bekle ve Oku
	buf := make([]byte, 1024)
	n, err := conn.Read(buf) // 'n' burada OKUNAN byte sayısını tutuyor
	if err != nil {
		fmt.Println("❌ Failed to read server response")
		return
	}

	// Gelen mesajı çöz (Decode)
	raw, err := protocol.Decode(buf[:n]) // 'n' değişkenini burada KULLANDIK!
	if err != nil {
		fmt.Println("❌ Protocol error")
		return
	}

	var resp protocol.HandshakeResponse
	err = json.Unmarshal(raw.Payload, &resp) // 'resp' değişkenini burada KULLANDIK!
	if err != nil {
		fmt.Println("❌ Failed to parse server response")
		return
	}

	// Eğer sunucu reddettiyse dur
	if resp.Status != "success" {
		fmt.Printf("🔴 Connection Rejected: %s\n", resp.Message)
		return
	}

	// 3. UI Göster ve Tüneli Ateşle
	client.ShowWelcome("http://"+subdomain+".binboi.link", port, "Sardor Azimov", "eu-central")

	// Yamux Client başlat
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
			local, err := net.Dial("tcp", fmt.Sprintf("localhost:%d", port))
			if err != nil {
				s.Close()
				return
			}
			server.Relay(s, local)
		}(stream)
	}
}