package auth

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

// GenerateNewKey: Güvenli ve rastgele bir hex string üretir
func GenerateNewKey() string {
	b := make([]byte, 16)
	rand.Read(b)
	return fmt.Sprintf("binboi_live_%s", hex.EncodeToString(b))
}