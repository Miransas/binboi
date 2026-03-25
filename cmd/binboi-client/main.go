package main

import (
	"fmt"
	"os"
	"strconv"

	"github.com/miransas/binboi/internal/cli"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("🌌 BINBOI - Neural Tunneling CLI")
		fmt.Println("Usage: binboi-client <command> [arguments]")
		return
	}

	switch os.Args[1] {
	case "auth":
		if len(os.Args) < 3 {
			fmt.Println("❌ Usage: binboi-client auth <api_key>")
			return
		}
		// internal/config paketini kullanarak key'i kaydet
		err := cli.SaveConfig(os.Args[2])
		if err != nil {
			fmt.Printf("🔴 Config error: %v\n", err)
			return
		}
		fmt.Println("🚀 [NEURAL_LINK]: API Key secured.")

	case "start":
		port := 3000
		if len(os.Args) > 2 {
			p, err := strconv.Atoi(os.Args[2])
			if err == nil { port = p }
		}

		apiKey, err := cli.LoadConfig()
		if err != nil {
			fmt.Println("🔑 [AUTH_REQUIRED]: Run 'binboi-client auth <key>' first.")
			return
		}

		fmt.Printf("📡 Initializing tunnel for localhost:%d...\n", port)
		cli.StartHttpTunnel(apiKey, port, "sazlab")

	default:
		fmt.Println("Unknown command. Use auth, start, or version.")
	}
}
