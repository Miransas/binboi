package cli

import (

	"log"
	"strconv"

	"github.com/miransas/binboi/internal/config"
    "github.com/miransas/binboi/internal/client"
	"github.com/spf13/cobra"
)

var httpCmd = &cobra.Command{
	Use:   "http [port]",
	Short: "Start a neural tunnel to a local HTTP server",
	Args:  cobra.ExactArgs(1), // Port numarası zorunlu
	Run: func(cmd *cobra.Command, args []string) {
		// 1. Portun sayı olup olmadığını kontrol et
		port, err := strconv.Atoi(args[0])
		if err != nil {
			log.Fatalf("🔴 Error: Port must be a valid number. Got: %s", args[0])
		}

		// 2. YAML Dosyasından Token'ı Oku
		token, err := config.LoadToken()
		if err != nil {
			log.Fatalf("🔴 %v\nRun 'binboi config add-authtoken <token>' to authenticate.", err)
		}

		// 3. UI'ı Çiz (Terminali temizler ve neon kutuyu basar)
		// Şimdilik domain kısmını statik veriyoruz, WebSocket bağlandığında Core sunucusu asıl domaini dönecek
		client.ShowWelcome("https://your-node.binboi.link", port, "Miransas Network", "eu-central")

		// 4. TODO: Token ile birlikte Binboi Core'a (8080) WebSocket bağlantısı aç...
		// wsConn := connectToCore(token)
		
		// 5. Trafiği yönlendirmeye başla (relay.go'daki fonksiyonumuz)
		// client.StartRelay(wsConn, port)
	},
}
