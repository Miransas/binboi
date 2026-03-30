package main


import (
	"testing"
)

func TestParseStartArgs(t *testing.T) {
	tests := []struct {
		name         string
		args         []string
		fallbackName string
		wantPort     int
		wantSub      string
	}{
		{
			name:         "defaults to port 3000 and fallback name",
			args:         []string{"binboi", "start"},
			fallbackName: "neon-ghost-123",
			wantPort:     3000,
			wantSub:      "neon-ghost-123",
		},
		{
			name:         "uses custom port and fallback name",
			args:         []string{"binboi", "start", "8080"},
			fallbackName: "cyber-pulse-99",
			wantPort:     8080,
			wantSub:      "cyber-pulse-99",
		},
		{
			name:         "uses custom port and explicit subdomain",
			args:         []string{"binboi", "start", "5000", "asardor"},
			fallbackName: "ignore-me",
			wantPort:     5000,
			wantSub:      "asardor",
		},
		{
			name:         "falls back to default port on invalid input",
			args:         []string{"binboi", "start", "invalid-port"},
			fallbackName: "test-node",
			wantPort:     3000,
			wantSub:      "test-node",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ParseStartArgs(tt.args, tt.fallbackName)
			if got.Port != tt.wantPort {
				t.Errorf("ParseStartArgs() Port = %v, want %v", got.Port, tt.wantPort)
			}
			if got.Subdomain != tt.wantSub {
				t.Errorf("ParseStartArgs() Subdomain = %v, want %v", got.Subdomain, tt.wantSub)
			}
		})
	}
}
