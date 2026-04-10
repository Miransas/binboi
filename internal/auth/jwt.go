package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"time"
)

var (
	ErrTokenExpired   = errors.New("token expired")
	ErrTokenInvalid   = errors.New("invalid token")
	ErrTokenMalformed = errors.New("malformed token")
)

// JWTClaims holds the payload fields embedded in every Binboi JWT.
type JWTClaims struct {
	Sub   string `json:"sub"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Plan  string `json:"plan"`
	IAT   int64  `json:"iat"`
	EXP   int64  `json:"exp"`
}

var encodedHeader = base64RawURL([]byte(`{"alg":"HS256","typ":"JWT"}`))

// SignJWT creates a signed HS256 JWT string from the given claims.
func SignJWT(secret string, claims JWTClaims) (string, error) {
	payload, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	hp := encodedHeader + "." + base64RawURL(payload)
	sig := hmacSHA256([]byte(secret), []byte(hp))
	return hp + "." + base64RawURL(sig), nil
}

// VerifyJWT validates the signature and expiry of a JWT, returning its claims.
func VerifyJWT(secret, token string) (*JWTClaims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, ErrTokenMalformed
	}

	hp := parts[0] + "." + parts[1]
	expected := base64RawURL(hmacSHA256([]byte(secret), []byte(hp)))
	if !hmac.Equal([]byte(expected), []byte(parts[2])) {
		return nil, ErrTokenInvalid
	}

	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, ErrTokenMalformed
	}

	var claims JWTClaims
	if err := json.Unmarshal(payloadBytes, &claims); err != nil {
		return nil, ErrTokenMalformed
	}

	if claims.EXP > 0 && time.Now().Unix() > claims.EXP {
		return nil, ErrTokenExpired
	}

	return &claims, nil
}

func base64RawURL(data []byte) string {
	return base64.RawURLEncoding.EncodeToString(data)
}

func hmacSHA256(key, data []byte) []byte {
	h := hmac.New(sha256.New, key)
	h.Write(data)
	return h.Sum(nil)
}
