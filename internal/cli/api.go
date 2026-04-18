package cli

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// ── shared API types ──────────────────────────────────────────────────────────

// Tunnel mirrors the JSON shape returned by GET /api/v1/tunnels.
type Tunnel struct {
	ID              string `json:"id"`
	Subdomain       string `json:"subdomain"`
	Target          string `json:"target"`
	Status          string `json:"status"`
	Region          string `json:"region"`
	RequestCount    int    `json:"request_count"`
	BytesOut        int64  `json:"bytes_out"`
	PublicURL       string `json:"public_url"`
	LastConnectedAt string `json:"last_connected_at"`
}

// Request mirrors the JSON shape returned by GET /api/v1/requests.
type Request struct {
	ID              string `json:"id"`
	TunnelSubdomain string `json:"tunnel_subdomain"`
	Method          string `json:"method"`
	Path            string `json:"path"`
	Status          int    `json:"status"`
	DurationMs      int    `json:"duration_ms"`
	CreatedAt       string `json:"created_at"`
}

// ── generic GET helper ────────────────────────────────────────────────────────

// apiGet performs an authenticated GET request and decodes the response into
// out. It handles both a plain JSON body and the {"data": ...} envelope that
// the control plane wraps paginated results in.
func apiGet(token, path string, out any) error {
	req, err := http.NewRequest(http.MethodGet, APIBaseURL()+path, nil)
	if err != nil {
		return fmt.Errorf("build request: %w", err)
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+strings.TrimSpace(token))
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var errBody struct {
			Error string `json:"error"`
		}
		_ = json.Unmarshal(body, &errBody)
		if errBody.Error != "" {
			return fmt.Errorf("%s", errBody.Error)
		}
		return fmt.Errorf("HTTP %d", resp.StatusCode)
	}

	// Try envelope {"data": ...} first; fall back to bare value.
	var envelope struct {
		Data json.RawMessage `json:"data"`
	}
	if err := json.Unmarshal(body, &envelope); err == nil && len(envelope.Data) > 0 && envelope.Data[0] != 'n' {
		return json.Unmarshal(envelope.Data, out)
	}
	return json.Unmarshal(body, out)
}

// ── domain-specific helpers ───────────────────────────────────────────────────

// ListTunnels fetches all tunnel reservations from the control plane.
func ListTunnels(token string) ([]Tunnel, error) {
	var tunnels []Tunnel
	if err := apiGet(token, "/api/v1/tunnels", &tunnels); err != nil {
		return nil, err
	}
	return tunnels, nil
}

// ListRequests fetches recent HTTP requests logged by the control plane.
func ListRequests(token string) ([]Request, error) {
	var reqs []Request
	if err := apiGet(token, "/api/v1/requests", &reqs); err != nil {
		return nil, err
	}
	return reqs, nil
}

// ── auth types ────────────────────────────────────────────────────────────────

type WhoAmIResponse struct {
	User struct {
		ID    string `json:"id"`
		Name  string `json:"name"`
		Email string `json:"email"`
		Plan  string `json:"plan"`
	} `json:"user"`
	TokenPrefix string `json:"token_prefix"`
	AuthMode    string `json:"auth_mode"`
}

// APIBaseURL returns the resolved control-plane API base URL.
// Resolution order: BINBOI_API_URL env → config.json api_url → DefaultAPIURL.
func APIBaseURL() string {
	return ResolveAPIURL("")
}

func DashboardAccessTokensURL() string {
	if value := strings.TrimSpace(os.Getenv("BINBOI_DASHBOARD_URL")); value != "" {
		return strings.TrimRight(value, "/")
	}
	return "http://127.0.0.1:3000/dashboard/access-tokens"
}

func WhoAmI(token string) (*WhoAmIResponse, error) {
	req, err := http.NewRequest(http.MethodGet, APIBaseURL()+"/api/v1/auth/me", nil)
	if err != nil {
		return nil, fmt.Errorf("build auth request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+strings.TrimSpace(token))

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request auth status: %w", err)
	}
	defer resp.Body.Close()

	var body struct {
		Error string `json:"error"`
		WhoAmIResponse
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return nil, fmt.Errorf("decode auth response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		if body.Error == "" {
			body.Error = resp.Status
		}
		return nil, fmt.Errorf("authentication failed: %s", body.Error)
	}

	return &body.WhoAmIResponse, nil
}
