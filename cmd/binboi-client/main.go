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
		fmt.Println("Binboi CLI v0.3.0")
	default:
		showHelp()
	}
}

func handleAuth() {
	if len(os.Args) < 3 {
		fmt.Println("Usage: binboi auth <instance-token>")
		return
	}
	if err := cli.SaveConfig(os.Args[2]); err != nil {
		fmt.Printf("Could not save token: %v\n", err)
		return
	}
	fmt.Println("Saved the instance token to ~/.binboi/config.json")
}

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

func handleStart() {
	config := ParseStartArgs(os.Args, utils.GenerateCyberName())

	apiKey, err := cli.LoadConfig()
	if err != nil {
		fmt.Println("Authentication required. Run 'binboi auth <instance-token>' first.")
		return
	}

	if err := cli.StartHttpTunnel(apiKey, config.Port, config.Subdomain); err != nil {
		fmt.Printf("Tunnel failed: %v\n", err)
	}
}

func showHelp() {
	fmt.Println("\nBINBOI CLI")
	fmt.Println("Usage: binboi <command> [arguments]")
	fmt.Println("\nCommands:")
	fmt.Println("  auth <token>         Save the instance token")
	fmt.Println("  start <port> [sub]   Start a tunnel for the local port")
	fmt.Println("  version              Show the CLI version")
}
