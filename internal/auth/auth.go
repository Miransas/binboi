package auth

import "errors"

var tokens = map[string]string{
	"ela_free_test": "user_1",
}

func VerifyToken(token string) (string, error) {
	if user, ok := tokens[token]; ok {
		return user, nil
	}
	return "", errors.New("invalid token")
}
