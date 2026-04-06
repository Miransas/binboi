package controlplane

import (
	"errors"
	"strings"
	"time"
)

const maxSearchQueryBytes = 120

type eventListOptions struct {
	Limit        int
	Level        string
	Action       string
	Tunnel       string
	ResourceType string
	ResourceID   string
	RequestID    string
	Since        *time.Time
	Until        *time.Time
	Query        string
}

type requestListOptions struct {
	Limit       int
	Kind        string
	Tunnel      string
	Provider    string
	EventType   string
	DeliveryID  string
	Since       *time.Time
	Until       *time.Time
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

func normalizeEventActionFilter(raw string) string {
	value := strings.ToLower(strings.TrimSpace(raw))
	if value == "" {
		return ""
	}
	if len(value) > 80 {
		value = value[:80]
	}
	return value
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

func normalizeFilterValue(raw string, max int) string {
	value := strings.ToLower(strings.TrimSpace(raw))
	if value == "" {
		return ""
	}
	if max > 0 && len(value) > max {
		value = value[:max]
	}
	return value
}

func parseBoolQuery(raw string) bool {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "1", "true", "yes", "on":
		return true
	default:
		return false
	}
}

func parseTimeWindowFilters(sinceRaw, untilRaw string) (*time.Time, *time.Time, error) {
	since, err := parseTimestampFilter(sinceRaw)
	if err != nil {
		return nil, nil, err
	}
	until, err := parseTimestampFilter(untilRaw)
	if err != nil {
		return nil, nil, err
	}
	if since != nil && until != nil && since.After(*until) {
		return nil, nil, errors.New("since must be earlier than or equal to until")
	}
	return since, until, nil
}

func parseTimestampFilter(raw string) (*time.Time, error) {
	value := strings.TrimSpace(raw)
	if value == "" {
		return nil, nil
	}
	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		return nil, errors.New("timestamp filters must use RFC3339")
	}
	utc := parsed.UTC()
	return &utc, nil
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
