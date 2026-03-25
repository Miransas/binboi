package cli

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type Config struct {
	ApiKey string `json:"api_key"`
}

func SaveConfig(key string) error {
	home, _ := os.UserHomeDir()
	path := filepath.Join(home, ".binboi", "config.json")
	os.MkdirAll(filepath.Dir(path), 0755)
	data, _ := json.Marshal(Config{ApiKey: key})
	return os.WriteFile(path, data, 0644)
}

func LoadConfig() (string, error) {
	home, _ := os.UserHomeDir()
	path := filepath.Join(home, ".binboi", "config.json")
	data, err := os.ReadFile(path)
	if err != nil { return "", err }
	var c Config
	json.Unmarshal(data, &c)
	return c.ApiKey, nil
}