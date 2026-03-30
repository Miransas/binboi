package auth

// GenerateNewKey keeps older packages building while using the current preview token format.
func GenerateNewKey() string {
	return GenerateSecureToken()
}
