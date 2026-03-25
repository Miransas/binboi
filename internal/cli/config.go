package cli

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type Config struct {
	ApiKey string `json:"api_key"`
}



// SaveConfig: API Key'i kullanıcın ana dizinine gizli bir dosya olarak kaydeder
func SaveConfig(key string) error {
	home, _ := os.UserHomeDir()
	configDir := filepath.Join(home, ".binboi")
	
	// Klasör yoksa oluştur
	os.MkdirAll(configDir, 0755)

	config := Config{ApiKey: key}
	data, _ := json.MarshalIndent(config, "", "  ")

	return os.WriteFile(filepath.Join(configDir, "config.json"), data, 0644)
}

// LoadConfig: Kayıtlı key'i okur
func LoadConfig() (string, error) {
	home, _ := os.UserHomeDir()
	path := filepath.Join(home, ".binboi", "config.json")
	
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}

	var config Config
	json.Unmarshal(data, &config)
	return config.ApiKey, nil
}