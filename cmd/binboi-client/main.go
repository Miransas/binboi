package main

import (
	"errors"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"time"

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
	case "logout":
		handleLogout()
	case "auth":
		handleLegacyAuthAlias(os.Args[2:])
	case "whoami":
		handleWhoAmI(os.Args[2:])
	case "http":
		handleStart()
	case "start":
		handleStart()
	case "tunnels", "ls":
		handleTunnels()
	case "open":
		handleOpen(os.Args[2:])
	case "requests", "reqs":
		handleRequests(os.Args[2:])
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

	tokenFlag  := flags.String("token",  "", "Personal access token from the dashboard")
	serverFlag := flags.String("server", "", "Relay server address (host:port), default: "+cli.DefaultServerAddr)
	apiFlag    := flags.String("api",    "", "Control-plane API URL, default: "+cli.DefaultAPIURL)
	if err := flags.Parse(args); err != nil {
		return
	}

	// Resolve API URL first so WhoAmI hits the right endpoint.
	apiURL := cli.ResolveAPIURL(*apiFlag)

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

	serverAddr := cli.ResolveServerAddr(*serverFlag)
	if err := cli.SaveConfig(cli.Config{
		Token:      token,
		ServerAddr: serverAddr,
		APIURL:     apiURL,
	}); err != nil {
		fmt.Printf("Could not save config: %v\n", err)
		return
	}

	nameOrEmail := strings.TrimSpace(identity.User.Email)
	if displayName := strings.TrimSpace(identity.User.Name); displayName != "" {
		nameOrEmail = fmt.Sprintf("%s <%s>", displayName, identity.User.Email)
	}

	fmt.Printf("Authenticated as %s\n", nameOrEmail)
	fmt.Printf("Plan:   %s\n", strings.ToUpper(identity.User.Plan))
	fmt.Printf("Token:  %s (%s)\n", identity.TokenPrefix, source)
	fmt.Printf("API:    %s\n", apiURL)
	fmt.Printf("Server: %s\n", serverAddr)
	fmt.Printf("Saved:  %s\n", cli.SavedTokenPath())
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

func handleLogout() {
	if err := cli.ClearToken(); err != nil {
		fmt.Printf("Logout failed: %v\n", err)
		return
	}
	fmt.Println("Logged out. Token removed from", cli.SavedTokenPath())
}

func handleTunnels() {
	token, _, err := cli.ResolveToken("")
	if err != nil {
		printMissingToken()
		return
	}

	tunnels, err := cli.ListTunnels(token)
	if err != nil {
		fmt.Printf("Failed to list tunnels: %v\n", err)
		return
	}

	if len(tunnels) == 0 {
		fmt.Println("No tunnels found.")
		return
	}

	fmt.Printf("%-22s %-10s %-22s %s\n", "SUBDOMAIN", "STATUS", "TARGET", "URL")
	fmt.Println(strings.Repeat("─", 90))
	for _, t := range tunnels {
		status := t.Status
		fmt.Printf("%-22s %-10s %-22s %s\n", t.Subdomain, status, t.Target, t.PublicURL)
	}
}

func handleOpen(args []string) {
	token, _, err := cli.ResolveToken("")
	if err != nil {
		printMissingToken()
		return
	}

	tunnels, err := cli.ListTunnels(token)
	if err != nil {
		fmt.Printf("Failed to list tunnels: %v\n", err)
		return
	}

	var target *cli.Tunnel

	if len(args) > 0 {
		subdomain := args[0]
		for i := range tunnels {
			if tunnels[i].Subdomain == subdomain {
				target = &tunnels[i]
				break
			}
		}
		if target == nil {
			fmt.Printf("Tunnel %q not found.\n", subdomain)
			return
		}
	} else {
		// Pick first ACTIVE tunnel, fall back to first in list.
		for i := range tunnels {
			if tunnels[i].Status == "ACTIVE" {
				target = &tunnels[i]
				break
			}
		}
		if target == nil && len(tunnels) > 0 {
			target = &tunnels[0]
		}
	}

	if target == nil {
		fmt.Println("No tunnels found.")
		return
	}

	fmt.Printf("Opening %s\n", target.PublicURL)
	if err := openBrowser(target.PublicURL); err != nil {
		fmt.Printf("Could not open browser automatically: %v\n", err)
	}
}

func openBrowser(url string) error {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", url)
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	return cmd.Start()
}

func handleRequests(args []string) {
	token, _, err := cli.ResolveToken("")
	if err != nil {
		printMissingToken()
		return
	}

	// Optional subdomain filter as first positional arg.
	subdomain := ""
	if len(args) > 0 {
		subdomain = args[0]
	}

	reqs, err := cli.ListRequests(token)
	if err != nil {
		fmt.Printf("Failed to list requests: %v\n", err)
		return
	}

	// Filter by subdomain if specified.
	if subdomain != "" {
		filtered := reqs[:0]
		for _, r := range reqs {
			if r.TunnelSubdomain == subdomain {
				filtered = append(filtered, r)
			}
		}
		reqs = filtered
	}

	// Show at most the 10 most recent.
	if len(reqs) > 10 {
		reqs = reqs[:10]
	}

	if len(reqs) == 0 {
		if subdomain != "" {
			fmt.Printf("No requests found for tunnel %q.\n", subdomain)
		} else {
			fmt.Println("No requests found.")
		}
		return
	}

	fmt.Printf("%-8s  %-7s  %-30s  %-6s  %s\n", "TIME", "METHOD", "PATH", "STATUS", "DURATION")
	fmt.Println(strings.Repeat("─", 72))
	for _, r := range reqs {
		ts, _ := time.Parse(time.RFC3339Nano, r.CreatedAt)
		if ts.IsZero() {
			ts, _ = time.Parse(time.RFC3339, r.CreatedAt)
		}
		timeStr := ts.Format("15:04:05")

		dur := fmt.Sprintf("%dms", r.DurationMs)
		if r.DurationMs >= 1000 {
			dur = fmt.Sprintf("%.1fs", float64(r.DurationMs)/1000)
		}

		path := r.Path
		if len(path) > 30 {
			path = path[:27] + "..."
		}

		fmt.Printf("%-8s  %-7s  %-30s  %-6d  %s\n", timeStr, r.Method, path, r.Status, dur)
	}
}

func showHelp() {
	fmt.Println("\nBINBOI CLI")
	fmt.Println("Usage: binboi <command> [arguments]")
	fmt.Println("\nAuth:")
	fmt.Println("  login [--token ...] [--server host:port]  Verify and save an access token")
	fmt.Println("  logout                                    Remove the saved token")
	fmt.Println("  whoami                                    Show the authenticated account")
	fmt.Println("\nTunnels:")
	fmt.Println("  http <port> [sub]                         Start an HTTP tunnel")
	fmt.Println("  start <port> [sub]                        Alias for 'http'")
	fmt.Println("  tunnels                                   List all tunnel reservations")
	fmt.Println("  open [subdomain]                          Open a tunnel URL in the browser")
	fmt.Println("\nInspection:")
	fmt.Println("  requests [subdomain]                      Show last 10 HTTP requests")
	fmt.Println("\nOther:")
	fmt.Println("  version                                   Show the CLI version")
	fmt.Println("\nEnvironment:")
	fmt.Println("  BINBOI_API_URL       Control plane API URL")
	fmt.Println("  BINBOI_SERVER_ADDR   Relay server address (overrides config.json)")
	fmt.Println("  BINBOI_AUTH_TOKEN    Access token for non-interactive use")
	fmt.Println("\nDefaults:")
	fmt.Println("  Relay server:        " + cli.DefaultServerAddr)
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
