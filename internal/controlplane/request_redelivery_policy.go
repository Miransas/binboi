package controlplane

import "strings"

type RequestReplayPolicy struct {
	Provider         string `json:"provider,omitempty"`
	EventType        string `json:"event_type,omitempty"`
	DeliveryID       string `json:"delivery_id,omitempty"`
	Mode             string `json:"mode"`
	DedupeKey        string `json:"dedupe_key,omitempty"`
	VerificationHint string `json:"verification_hint,omitempty"`
	SignaturePresent bool   `json:"signature_present"`
}

func replayPolicyForRequest(record RequestRecord) *RequestReplayPolicy {
	provider := strings.TrimSpace(record.Provider)
	eventType := strings.TrimSpace(record.EventType)
	deliveryID := strings.TrimSpace(record.DeliveryID)
	metadata := unmarshalRequestMetadata(record.MetadataJSON)
	if deliveryID == "" {
		if value, ok := metadata["delivery_id"].(string); ok {
			deliveryID = strings.TrimSpace(value)
		}
	}
	if deliveryID == "" {
		deliveryID = requestPreviewHeaderValue(record.RequestHeaders, "x-github-delivery")
		if deliveryID == "" {
			deliveryID = requestPreviewHeaderValue(record.RequestHeaders, "svix-id")
		}
		if deliveryID == "" {
			deliveryID = requestPreviewHeaderValue(record.RequestHeaders, "webhook-id")
		}
	}
	if eventType == "" {
		eventType = requestPreviewHeaderValue(record.RequestHeaders, "x-github-event")
		if eventType == "" {
			eventType = requestPreviewHeaderValue(record.RequestHeaders, "x-event-type")
		}
		if eventType == "" {
			eventType = requestPreviewHeaderValue(record.RequestHeaders, "x-webhook-event")
		}
	}

	signaturePresent, _ := metadata["signature_present"].(bool)
	if !signaturePresent {
		signaturePresent = requestPreviewHasAnyHeader(record.RequestHeaders,
			"stripe-signature",
			"svix-signature",
			"x-supabase-signature",
			"x-hub-signature-256",
			"linear-signature",
			"webhook-signature",
			"x-webhook-signature",
		)
	}

	if !strings.EqualFold(record.Kind, "WEBHOOK") && provider == "" && deliveryID == "" && eventType == "" {
		return nil
	}

	policy := &RequestReplayPolicy{
		Provider:         provider,
		EventType:        eventType,
		DeliveryID:       deliveryID,
		Mode:             "manual-header-replay",
		SignaturePresent: signaturePresent,
	}

	switch strings.ToLower(provider) {
	case "github":
		policy.DedupeKey = fallbackString(deliveryID, "binboi-request:"+record.ID)
		policy.VerificationHint = "Verify X-GitHub-Delivery and X-GitHub-Event before accepting a manual redelivery."
	case "clerk":
		policy.DedupeKey = fallbackString(deliveryID, "binboi-request:"+record.ID)
		policy.VerificationHint = "Verify Svix-Id and Svix-Signature before accepting a manual redelivery."
	case "stripe":
		policy.DedupeKey = fallbackString(deliveryID, "binboi-request:"+record.ID)
		policy.VerificationHint = "Use the original Stripe event id for dedupe and re-check Stripe-Signature freshness on replay."
	case "supabase":
		policy.DedupeKey = fallbackString(deliveryID, "binboi-request:"+record.ID)
		policy.VerificationHint = "Validate the Supabase delivery id and signature before processing a manual redelivery."
	case "linear":
		policy.DedupeKey = fallbackString(deliveryID, "binboi-request:"+record.ID)
		policy.VerificationHint = "Validate the Linear delivery signature and event name before processing a manual redelivery."
	case "neon":
		policy.DedupeKey = fallbackString(deliveryID, "binboi-request:"+record.ID)
		policy.VerificationHint = "Use the original Neon delivery id to dedupe this manual redelivery."
	default:
		if deliveryID != "" {
			policy.DedupeKey = deliveryID
		} else {
			policy.DedupeKey = "binboi-request:" + record.ID
		}
		policy.VerificationHint = "Use the original delivery id or request id to dedupe this manual redelivery."
	}

	return policy
}

func requestPreviewHeaderValue(raw, headerName string) string {
	headerName = strings.ToLower(strings.TrimSpace(headerName))
	if headerName == "" {
		return ""
	}

	for _, line := range splitPreviewLines(raw) {
		parts := strings.SplitN(line, ":", 2)
		if len(parts) != 2 {
			continue
		}
		if strings.ToLower(strings.TrimSpace(parts[0])) != headerName {
			continue
		}
		return strings.TrimSpace(parts[1])
	}
	return ""
}

func requestPreviewHasAnyHeader(raw string, names ...string) bool {
	for _, name := range names {
		if requestPreviewHeaderValue(raw, name) != "" {
			return true
		}
	}
	return false
}
