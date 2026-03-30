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
