package auth

import "testing"

func TestGenerateAccessTokenIncludesStablePrefix(t *testing.T) {
	fullToken, prefix, err := GenerateAccessToken()
	if err != nil {
		t.Fatalf("GenerateAccessToken() returned error: %v", err)
	}
	if fullToken == "" {
		t.Fatal("GenerateAccessToken() returned an empty token")
	}
	if prefix == "" {
		t.Fatal("GenerateAccessToken() returned an empty prefix")
	}

	parsedPrefix, err := ExtractAccessTokenPrefix(fullToken)
	if err != nil {
		t.Fatalf("ExtractAccessTokenPrefix() returned error: %v", err)
	}
	if parsedPrefix != prefix {
		t.Fatalf("ExtractAccessTokenPrefix() = %q, want %q", parsedPrefix, prefix)
	}
}

func TestSafeTokenLabelFallsBackGracefully(t *testing.T) {
	label := SafeTokenLabel("binboi_live_abcdefghijklmnopqrstuvwxyz")
	if label == "" {
		t.Fatal("SafeTokenLabel() returned an empty label")
	}
}
