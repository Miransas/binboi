package main

import (
	"errors"
	"flag"
	"fmt"
	"os"
	"strconv"
	"strings"

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
	case "login":
		handleLogin(os.Args[2:])
	case "auth":
		handleLegacyAuthAlias(os.Args[2:])
	case "whoami":
		handleWhoAmI(os.Args[2:])
	case "http":
		handleStart()
	case "start":
		handleStart()
	case "version":
		fmt.Println(cli.Version)
	default:
		showHelp()
	}
}

func handleLegacyAuthAlias(args []string) {
	if len(args) == 0 {
		fmt.Println("Usage: binboi auth <access-token>")
		return
	}
	handleLogin([]string{"--token", args[0]})
}

func handleLogin(args []string) {
	flags := flag.NewFlagSet("login", flag.ContinueOnError)
	flags.SetOutput(os.Stdout)

	tokenFlag := flags.String("token", "", "Personal access token from the dashboard")
	if err := flags.Parse(args); err != nil {
		return
	}

	token, source, err := cli.ResolveToken(*tokenFlag)
	if err != nil {
		printMissingToken()
		return
	}

	identity, err := cli.WhoAmI(token)
	if err != nil {
		fmt.Printf("Login failed: %v\n", err)
		return
	}

	if err := cli.SaveToken(token); err != nil {
		fmt.Printf("Could not save token: %v\n", err)
		return
	}

	nameOrEmail := strings.TrimSpace(identity.User.Email)
	if displayName := strings.TrimSpace(identity.User.Name); displayName != "" {
		nameOrEmail = fmt.Sprintf("%s <%s>", displayName, identity.User.Email)
	}

	fmt.Printf("Authenticated as %s\n", nameOrEmail)
	fmt.Printf("Plan: %s\n", strings.ToUpper(identity.User.Plan))
	fmt.Printf("Token: %s (%s)\n", identity.TokenPrefix, source)
	fmt.Printf("Saved to %s\n", cli.SavedTokenPath())
}

func handleWhoAmI(args []string) {
	flags := flag.NewFlagSet("whoami", flag.ContinueOnError)
	flags.SetOutput(os.Stdout)

	tokenFlag := flags.String("token", "", "Personal access token to verify")
	if err := flags.Parse(args); err != nil {
		return
	}

	token, _, err := cli.ResolveToken(*tokenFlag)
	if err != nil {
		printMissingToken()
		return
	}

	identity, err := cli.WhoAmI(token)
	if err != nil {
		fmt.Printf("Auth check failed: %v\n", err)
		return
	}

	fmt.Printf("User: %s\n", identity.User.Email)
	if strings.TrimSpace(identity.User.Name) != "" {
		fmt.Printf("Name: %s\n", identity.User.Name)
	}
	fmt.Printf("Plan: %s\n", strings.ToUpper(identity.User.Plan))
	fmt.Printf("Token: %s\n", identity.TokenPrefix)
	fmt.Printf("Auth mode: %s\n", identity.AuthMode)
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

	apiKey, _, err := cli.ResolveToken("")
	if err != nil {
		printMissingToken()
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
	fmt.Println("  login [--token ...]  Verify and save an access token")
	fmt.Println("  whoami               Show the authenticated account")
	fmt.Println("  http <port> [sub]    Start an HTTP tunnel for the local port")
	fmt.Println("  start <port> [sub]   Alias for 'http'")
	fmt.Println("  version              Show the CLI version")
	fmt.Println("\nEnvironment:")
	fmt.Println("  BINBOI_API_URL       Control plane API URL for login/whoami")
	fmt.Println("  BINBOI_SERVER_ADDR   Relay listener address for tunnel traffic")
	fmt.Println("  BINBOI_AUTH_TOKEN    Access token for non-interactive use")
}

func printMissingToken() {
	if _, err := cli.LoadToken(); err != nil && !errors.Is(err, cli.ErrTokenNotFound) {
		fmt.Printf("Could not read %s: %v\n", cli.SavedTokenPath(), err)
		return
	}

	fmt.Println("No Binboi access token is configured.")
	fmt.Printf("Create one in the dashboard: %s\n", cli.DashboardAccessTokensURL())
	fmt.Println("Then run: binboi login --token <token>")
}
