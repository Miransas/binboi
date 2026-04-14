package cli

import (
	"errors"
	"testing"
)

func TestSaveAndLoadToken(t *testing.T) {
	t.Setenv("HOME", t.TempDir())

	want := "binboi_pat_test_secret"
	if err := SaveToken(want); err != nil {
		t.Fatalf("SaveToken() returned error: %v", err)
	}

	got, err := LoadToken()
	if err != nil {
		t.Fatalf("LoadToken() returned error: %v", err)
	}
	if got != want {
		t.Fatalf("LoadToken() = %q, want %q", got, want)
	}
}

func TestResolveTokenPriority(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	t.Setenv("BINBOI_AUTH_TOKEN", "binboi_pat_env_secret")

	if err := SaveToken("binboi_pat_config_secret"); err != nil {
		t.Fatalf("SaveToken() returned error: %v", err)
	}

	token, source, err := ResolveToken("binboi_pat_flag_secret")
	if err != nil {
		t.Fatalf("ResolveToken(flag) returned error: %v", err)
	}
	if token != "binboi_pat_flag_secret" || source != "flag" {
		t.Fatalf("ResolveToken(flag) = (%q, %q), want (%q, %q)", token, source, "binboi_pat_flag_secret", "flag")
	}

	token, source, err = ResolveToken("")
	if err != nil {
		t.Fatalf("ResolveToken(env) returned error: %v", err)
	}
	if token != "binboi_pat_env_secret" || source != "env:BINBOI_AUTH_TOKEN" {
		t.Fatalf("ResolveToken(env) = (%q, %q), want (%q, %q)", token, source, "binboi_pat_env_secret", "env:BINBOI_AUTH_TOKEN")
	}

	t.Setenv("BINBOI_AUTH_TOKEN", "")
	token, source, err = ResolveToken("")
	if err != nil {
		t.Fatalf("ResolveToken(config) returned error: %v", err)
	}
	if token != "binboi_pat_config_secret" || source != "config" {
		t.Fatalf("ResolveToken(config) = (%q, %q), want (%q, %q)", token, source, "binboi_pat_config_secret", "config")
	}
}

func TestResolveTokenMissing(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	t.Setenv("BINBOI_AUTH_TOKEN", "")
	t.Setenv("BINBOI_TOKEN", "")

	_, _, err := ResolveToken("")
	if !errors.Is(err, ErrTokenNotFound) {
		t.Fatalf("ResolveToken() error = %v, want %v", err, ErrTokenNotFound)
	}
}

func TestResolveServerAddr(t *testing.T) {
	t.Setenv("HOME", t.TempDir())
	t.Setenv("BINBOI_SERVER_ADDR", "")

	// No config, no env → default.
	if got := ResolveServerAddr(""); got != DefaultServerAddr {
		t.Fatalf("ResolveServerAddr(\"\") = %q, want %q", got, DefaultServerAddr)
	}

	// Explicit arg wins over everything.
	if got := ResolveServerAddr("custom.example.com:9999"); got != "custom.example.com:9999" {
		t.Fatalf("ResolveServerAddr(explicit) = %q, want explicit", got)
	}

	// Env var wins over config.
	t.Setenv("BINBOI_SERVER_ADDR", "env.example.com:8081")
	if got := ResolveServerAddr(""); got != "env.example.com:8081" {
		t.Fatalf("ResolveServerAddr(env) = %q, want env value", got)
	}
	t.Setenv("BINBOI_SERVER_ADDR", "")

	// Config wins over default.
	if err := SaveConfig(Config{Token: "tok", ServerAddr: "config.example.com:8081"}); err != nil {
		t.Fatalf("SaveConfig() error: %v", err)
	}
	if got := ResolveServerAddr(""); got != "config.example.com:8081" {
		t.Fatalf("ResolveServerAddr(config) = %q, want config value", got)
	}
}

func TestSaveTokenPreservesServerAddr(t *testing.T) {
	t.Setenv("HOME", t.TempDir())

	if err := SaveConfig(Config{Token: "old-tok", ServerAddr: "keep.example.com:8081"}); err != nil {
		t.Fatalf("SaveConfig() error: %v", err)
	}

	if err := SaveToken("new-tok"); err != nil {
		t.Fatalf("SaveToken() error: %v", err)
	}

	cfg, err := LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig() error: %v", err)
	}
	if cfg.Token != "new-tok" {
		t.Errorf("Token = %q, want %q", cfg.Token, "new-tok")
	}
	if cfg.ServerAddr != "keep.example.com:8081" {
		t.Errorf("ServerAddr = %q, want preserved value", cfg.ServerAddr)
	}
}
