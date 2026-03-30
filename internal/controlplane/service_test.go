package controlplane

import "testing"

func TestNormalizeSubdomain(t *testing.T) {
	value, err := normalizeSubdomain("My-App")
	if err != nil {
		t.Fatalf("normalizeSubdomain returned error: %v", err)
	}
	if value != "my-app" {
		t.Fatalf("expected my-app, got %s", value)
	}
}

func TestNormalizeTarget(t *testing.T) {
	target, port, err := normalizeTarget("localhost:4000")
	if err != nil {
		t.Fatalf("normalizeTarget returned error: %v", err)
	}
	if target != "http://localhost:4000" {
		t.Fatalf("unexpected target: %s", target)
	}
	if port != 4000 {
		t.Fatalf("unexpected port: %d", port)
	}
}

func TestExtractSubdomain(t *testing.T) {
	subdomain := extractSubdomain("demo.binboi.localhost:8000", "binboi.localhost")
	if subdomain != "demo" {
		t.Fatalf("expected demo, got %s", subdomain)
	}
}
