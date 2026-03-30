package cli

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

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

func APIBaseURL() string {
	if value := strings.TrimSpace(os.Getenv("BINBOI_API_URL")); value != "" {
		return strings.TrimRight(value, "/")
	}
	return "http://127.0.0.1:8080"
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
