package auth

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
)

// GenerateSecureToken creates a preview-friendly relay token.
func GenerateSecureToken() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	return fmt.Sprintf("binboi_live_%s", hex.EncodeToString(b))
}

// GenerateAccessToken creates a personal access token with a stable prefix.
func GenerateAccessToken() (fullToken string, prefix string, err error) {
	prefixBytes := make([]byte, 4)
	secretBytes := make([]byte, 18)

	if _, err = rand.Read(prefixBytes); err != nil {
		return "", "", err
	}
	if _, err = rand.Read(secretBytes); err != nil {
		return "", "", err
	}

	prefix = fmt.Sprintf("binboi_pat_%s", hex.EncodeToString(prefixBytes))
	fullToken = fmt.Sprintf("%s_%s", prefix, hex.EncodeToString(secretBytes))
	return fullToken, prefix, nil
}

// ExtractAccessTokenPrefix returns the indexed prefix used for DB lookups.
func ExtractAccessTokenPrefix(raw string) (string, error) {
	parts := strings.Split(strings.TrimSpace(raw), "_")
	if len(parts) != 4 || parts[0] != "binboi" || parts[1] != "pat" || parts[2] == "" || parts[3] == "" {
		return "", errors.New("invalid access token format")
	}
	return strings.Join(parts[:3], "_"), nil
}

// SafeTokenLabel returns a non-sensitive token label for logs and CLI output.
func SafeTokenLabel(raw string) string {
	if prefix, err := ExtractAccessTokenPrefix(raw); err == nil {
		return prefix
	}
	value := strings.TrimSpace(raw)
	if len(value) <= 16 {
		return value
	}
	return value[:16]
}
