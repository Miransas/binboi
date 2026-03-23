package config

type Config struct {
	ServerAddr string
	AuthToken  string
	Subdomain  string
	LocalPort  int
	DBURL      string // For the upcoming Postgres setup
}

// LoadConfig returns default settings (Later we can load from .env or YAML)
func LoadConfig() *Config {
	return &Config{
		ServerAddr: "0.0.0.0:8080",
		AuthToken:  "miransas-secret-2026",
		Subdomain:  "sazlab",
		LocalPort:  3000,
	}
}