package  db


import (
	"crypto/sha256"
	"encoding/hex"
)

// HashToken generates a secure SHA-256 hash of the provided plain-text token
func HashToken(token string) string {
	hash := sha256.New()
	hash.Write([]byte(token))
	return hex.EncodeToString(hash.Sum(nil))
}

// CheckToken validates a raw token against a stored hashed version
func CheckToken(rawToken, storedHash string) bool {
	return HashToken(rawToken) == storedHash
}