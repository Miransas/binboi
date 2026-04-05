package controlplane

import (
	"errors"
	"strings"
)

const maxSearchQueryBytes = 120

type eventListOptions struct {
	Limit  int
	Level  string
	Tunnel string
	Query  string
}

type requestListOptions struct {
	Limit       int
	Kind        string
	Tunnel      string
	Provider    string
	Query       string
	StatusClass string
	ErrorOnly   bool
}

func normalizeEventLevelFilter(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "":
		return ""
	case "info", "warn", "error":
		return strings.ToLower(strings.TrimSpace(raw))
	default:
		return ""
	}
}

func normalizeRequestKindFilter(raw string) string {
	value := strings.ToUpper(strings.TrimSpace(raw))
	switch value {
	case "", "ALL":
		return ""
	case "REQUEST", "WEBHOOK":
		return value
	default:
		return ""
	}
}

func normalizeStatusClassFilter(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "":
		return ""
	case "success", "client_error", "server_error", "error":
		return strings.ToLower(strings.TrimSpace(raw))
	default:
		return ""
	}
}

func normalizeSearchQuery(raw string) string {
	query := strings.TrimSpace(raw)
	if query == "" {
		return ""
	}
	if len(query) > maxSearchQueryBytes {
		query = query[:maxSearchQueryBytes]
	}
	return strings.ToLower(query)
}

func parseBoolQuery(raw string) bool {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "1", "true", "yes", "on":
		return true
	default:
		return false
	}
}

func normalizeDomainName(raw, baseDomain string) (string, error) {
	domain := strings.ToLower(strings.TrimSpace(strings.TrimSuffix(raw, ".")))
	if domain == "" {
		return "", errors.New("domain name is required")
	}
	if domain == strings.ToLower(strings.TrimSpace(baseDomain)) {
		return "", errors.New("managed base domain already exists")
	}
	if len(domain) > 253 {
		return "", errors.New("domain name is too long")
	}
	parts := strings.Split(domain, ".")
	if len(parts) < 2 {
		return "", errors.New("domain must be a fully-qualified hostname")
	}
	for _, part := range parts {
		if len(part) == 0 {
			return "", errors.New("domain labels cannot be empty")
		}
		if len(part) > 63 {
			return "", errors.New("domain labels must be 63 characters or fewer")
		}
		if part[0] == '-' || part[len(part)-1] == '-' {
			return "", errors.New("domain labels cannot start or end with a hyphen")
		}
		for _, ch := range part {
			if (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '-' {
				continue
			}
			return "", errors.New("domain labels must use lowercase letters, numbers, and hyphens")
		}
	}
	return domain, nil
}
