package cli

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

var ErrTokenNotFound = errors.New("no access token configured")

const (
	DefaultServerAddr = "binboi.com:8081"
	DefaultAPIURL     = "https://api.binboi.com"
)

type Config struct {
	Token      string `json:"token"`
	ServerAddr string `json:"server_addr"`
	APIURL     string `json:"api_url"`
}

func configPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("resolve home directory: %w", err)
	}

	path := filepath.Join(home, ".binboi", "config.json")
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return "", fmt.Errorf("create config directory: %w", err)
	}
	return path, nil
}

func SaveConfig(cfg Config) error {
	if cfg.ServerAddr == "" {
		cfg.ServerAddr = DefaultServerAddr
	}
	if cfg.APIURL == "" {
		cfg.APIURL = DefaultAPIURL
	}

	path, err := configPath()
	if err != nil {
		return err
	}

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return fmt.Errorf("encode config: %w", err)
	}

	if err := os.WriteFile(path, data, 0o600); err != nil {
		return fmt.Errorf("write config: %w", err)
	}

	return nil
}

func SaveToken(token string) error {
	token = strings.TrimSpace(token)
	if token == "" {
		return errors.New("token cannot be empty")
	}
	// Load existing config so we don't wipe other fields (e.g. ServerAddr).
	cfg, err := LoadConfig()
	if err != nil && !errors.Is(err, ErrTokenNotFound) {
		return err
	}
	cfg.Token = token
	return SaveConfig(cfg)
}

// ResolveServerAddr returns the relay address to connect to, checking (in
// order): explicit argument → BINBOI_SERVER_ADDR env var → config.json
// server_addr → DefaultServerAddr.
func ResolveServerAddr(explicit string) string {
	if addr := strings.TrimSpace(explicit); addr != "" {
		return addr
	}
	if addr := strings.TrimSpace(os.Getenv("BINBOI_SERVER_ADDR")); addr != "" {
		return addr
	}
	if cfg, err := LoadConfig(); err == nil {
		if addr := strings.TrimSpace(cfg.ServerAddr); addr != "" {
			return addr
		}
	}
	return DefaultServerAddr
}

// ResolveAPIURL returns the control-plane API base URL, checking (in order):
// explicit argument → BINBOI_API_URL env var → config.json api_url →
// DefaultAPIURL.
func ResolveAPIURL(explicit string) string {
	if u := strings.TrimSpace(explicit); u != "" {
		return strings.TrimRight(u, "/")
	}
	if u := strings.TrimSpace(os.Getenv("BINBOI_API_URL")); u != "" {
		return strings.TrimRight(u, "/")
	}
	if cfg, err := LoadConfig(); err == nil {
		if u := strings.TrimSpace(cfg.APIURL); u != "" {
			return strings.TrimRight(u, "/")
		}
	}
	return DefaultAPIURL
}

func LoadConfig() (Config, error) {
	path, err := configPath()
	if err != nil {
		return Config{}, err
	}

	data, err := os.ReadFile(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return Config{}, ErrTokenNotFound
		}
		return Config{}, fmt.Errorf("read config: %w", err)
	}

	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return Config{}, fmt.Errorf("parse config: %w", err)
	}
	return cfg, nil
}

// ClearToken removes the auth token from config.json while preserving
// server_addr and any other fields.
func ClearToken() error {
	cfg, err := LoadConfig()
	if err != nil && !errors.Is(err, ErrTokenNotFound) {
		return err
	}
	cfg.Token = ""
	return SaveConfig(cfg)
}

func LoadToken() (string, error) {
	cfg, err := LoadConfig()
	if err != nil {
		return "", err
	}
	token := strings.TrimSpace(cfg.Token)
	if token == "" {
		return "", ErrTokenNotFound
	}
	return token, nil
}

func ResolveToken(explicit string) (token string, source string, err error) {
	if token = strings.TrimSpace(explicit); token != "" {
		return token, "flag", nil
	}

	for _, key := range []string{"BINBOI_AUTH_TOKEN", "BINBOI_TOKEN"} {
		if token = strings.TrimSpace(os.Getenv(key)); token != "" {
			return token, fmt.Sprintf("env:%s", key), nil
		}
	}

	token, err = LoadToken()
	if err != nil {
		return "", "", err
	}
	return token, "config", nil
}

func SavedTokenPath() string {
	path, err := configPath()
	if err != nil {
		return "~/.binboi/config.json"
	}
	return path
}
