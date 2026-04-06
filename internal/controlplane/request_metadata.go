package controlplane

import (
	"encoding/json"
	"net/http"
	"strings"
)

func marshalRequestMetadata(metadata map[string]any) string {
	if len(metadata) == 0 {
		return ""
	}
	payload, err := json.Marshal(metadata)
	if err != nil {
		return ""
	}
	return string(payload)
}

func unmarshalRequestMetadata(raw string) map[string]any {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil
	}

	var metadata map[string]any
	if err := json.Unmarshal([]byte(raw), &metadata); err != nil {
		return nil
	}
	return metadata
}

func extractPayloadField(payloadPreview, key string) string {
	payloadPreview = strings.TrimSpace(payloadPreview)
	if payloadPreview == "" {
		return ""
	}

	for _, token := range []string{`"` + key + `":"`, `"` + key + `": "`} {
		index := strings.Index(payloadPreview, token)
		if index == -1 {
			continue
		}
		rest := payloadPreview[index+len(token):]
		end := strings.IndexAny(rest, `",}`)
		if end == -1 {
			end = len(rest)
		}
		return compactPreview(rest[:end], 160)
	}

	return ""
}

func inferRequestMetadata(headers http.Header, payloadPreview, provider, eventType string) (string, string) {
	normalizedProvider := strings.ToLower(strings.TrimSpace(provider))
	metadata := map[string]any{}

	if contentType := compactPreview(headers.Get("Content-Type"), 120); contentType != "" {
		metadata["content_type"] = contentType
	}
	if userAgent := compactPreview(headers.Get("User-Agent"), 160); userAgent != "" {
		metadata["user_agent"] = userAgent
	}
	if eventType = compactPreview(eventType, 160); eventType != "" {
		metadata["event_type"] = eventType
	}

	deliveryID := ""
	signaturePresent := false

	switch normalizedProvider {
	case "github":
		deliveryID = compactPreview(headers.Get("X-GitHub-Delivery"), 160)
		signaturePresent = strings.TrimSpace(headers.Get("X-Hub-Signature-256")) != ""
		if hookID := compactPreview(headers.Get("X-GitHub-Hook-ID"), 120); hookID != "" {
			metadata["hook_id"] = hookID
		}
	case "clerk":
		deliveryID = compactPreview(headers.Get("Svix-Id"), 160)
		signaturePresent = strings.TrimSpace(headers.Get("Svix-Signature")) != ""
		if timestamp := compactPreview(headers.Get("Svix-Timestamp"), 120); timestamp != "" {
			metadata["svix_timestamp"] = timestamp
		}
	case "stripe":
		deliveryID = extractPayloadField(payloadPreview, "id")
		signaturePresent = strings.TrimSpace(headers.Get("Stripe-Signature")) != ""
		if livemode := extractPayloadField(payloadPreview, "livemode"); livemode != "" {
			metadata["livemode"] = livemode
		}
	case "supabase":
		deliveryID = compactPreview(headers.Get("Webhook-Id"), 160)
		signaturePresent = strings.TrimSpace(headers.Get("X-Supabase-Signature")) != ""
	case "linear":
		deliveryID = compactPreview(headers.Get("Linear-Delivery"), 160)
		signaturePresent = strings.TrimSpace(headers.Get("Linear-Signature")) != ""
	case "neon":
		deliveryID = compactPreview(headers.Get("Webhook-Id"), 160)
		signaturePresent = strings.TrimSpace(headers.Get("Webhook-Signature")) != ""
	default:
		deliveryID = compactPreview(headers.Get("Webhook-Id"), 160)
		if deliveryID == "" {
			deliveryID = compactPreview(headers.Get("X-Request-Id"), 160)
		}
		signaturePresent = strings.TrimSpace(headers.Get("Webhook-Signature")) != "" ||
			strings.TrimSpace(headers.Get("X-Webhook-Signature")) != ""
	}

	if deliveryID == "" {
		deliveryID = extractPayloadField(payloadPreview, "id")
	}
	if signaturePresent {
		metadata["signature_present"] = true
	}
	if deliveryID != "" {
		metadata["delivery_id"] = deliveryID
	}

	return deliveryID, marshalRequestMetadata(metadata)
}
