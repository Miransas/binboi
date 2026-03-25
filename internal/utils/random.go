package utils

import (
	"fmt"
	"math/rand"
	"time"
)

var (
	adjectives = []string{
		"neon", "neural", "cyber", "ghost", "bit", "void", "dark", 
		"chrome", "static", "delta", "alpha", "omega", "vector", "binary",
	}
	nouns = []string{
		"phantom", "daemon", "link", "node", "core", "shell", "grid", 
		"pulse", "signal", "glitch", "proxy", "matrix", "shards", "protocol",
	}
)

// GenerateCyberName: 'neon-daemon-42' gibi rastgele siberpunk isimler üretir
func GenerateCyberName() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	adj := adjectives[r.Intn(len(adjectives))]
	noun := nouns[r.Intn(len(nouns))]
	num := r.Intn(999)

	return fmt.Sprintf("%s-%s-%d", adj, noun, num)
}