package auth

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

// GenerateSecureToken: binboi_live_... formatında rastgele bir key üretir
func GenerateSecureToken() string {
	b := make([]byte, 16) // 32 karakterlik bir hex için 16 byte yeterli
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	return fmt.Sprintf("binboi_live_%s", hex.EncodeToString(b))
}