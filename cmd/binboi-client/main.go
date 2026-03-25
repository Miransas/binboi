package main

import (
	"fmt"
	"os"
	"strconv"

	"github.com/miransas/binboi/internal/cli"
	"github.com/miransas/binboi/internal/utils"
)

// StartConfig: Test edilebilir çıktı yapısı
type StartConfig struct {
	Port      int
	Subdomain string
}

func main() {
	if len(os.Args) < 2 {
		showHelp()
		return
	}

	switch os.Args[1] {
	case "auth":
		handleAuth()
	case "start":
		handleStart()
	case "version":
		fmt.Println("Binboi Neural CLI v0.2.0")
	default:
		showHelp()
	}
}

// handleAuth: API Key kaydetme işini yönetir
func handleAuth() {
	if len(os.Args) < 3 {
		fmt.Println("❌ Usage: binboi-client auth <api_key>")
		return
	}
	if err := cli.SaveConfig(os.Args[2]); err != nil {
		fmt.Printf("🔴 Config error: %v\n", err)
		return
	}
	fmt.Println("🚀 [NEURAL_LINK]: API Key secured.")
}

// ParseStartArgs: Komut satırı argümanlarını işleyen saf mantık (TESTLER BURAYA BAKAR)
func ParseStartArgs(args []string, fallbackName string) StartConfig {
	port := 3000
	if len(args) > 2 {
		if p, err := strconv.Atoi(args[2]); err == nil {
			port = p
		}
	}

	subdomain := fallbackName
	if len(args) > 3 {
		subdomain = args[3]
	}

	return StartConfig{
		Port:      port,
		Subdomain: subdomain,
	}
}

// handleStart: Tüneli başlatma işini yönetir
func handleStart() {
	// 1. Argümanları işle (ParseStartArgs kullanarak)
	config := ParseStartArgs(os.Args, utils.GenerateCyberName())

	// 2. API Key Yükle
	apiKey, err := cli.LoadConfig()
	if err != nil {
		fmt.Println("🔑 [AUTH_REQUIRED]: Please run 'binboi-client auth <key>' first.")
		return
	}

	// 3. UI ve Tünel Başlat
	publicURL := fmt.Sprintf("https://%s.binboi.link", config.Subdomain)
	cli.RenderCoolUI(config.Subdomain, publicURL, config.Port)
	cli.StartHttpTunnel(apiKey, config.Port, config.Subdomain)
}

func showHelp() {
	fmt.Println("\n🌌 BINBOI - Neural Tunneling CLI")
	fmt.Println("Usage: binboi-client <command> [arguments]")
	fmt.Println("\nCommands:")
	fmt.Println("  auth <key>           Secure your access key")
	fmt.Println("  start <port> <sub>   Open a link (subdomain optional)")
	fmt.Println("  version              Show system version")
}