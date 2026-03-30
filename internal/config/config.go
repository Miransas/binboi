package config

import (
	"fmt"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

// 📦 Config Şeması: YAML dosyamızın tam karşılığı
type BinboiConfig struct {
	AuthToken string `yaml:"authtoken"`
	//
	// Region    string `yaml:"region,omitempty"`
	// LogLevel  string `yaml:"log_level,omitempty"`
}

// 📍 getConfigPath: İşletim sistemine göre doğru yolu bulur (Mac/Linux/Windows)
func getConfigPath() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", fmt.Errorf("failed to get home directory: %w", err)
	}

	// Klasör yolu: ~/.binboi
	configDir := filepath.Join(homeDir, ".binboi")

	// Klasör yoksa oluştur (Sadece okuma/yazma/çalıştırma izni kullanıcıya ait: 0700)
	if err := os.MkdirAll(configDir, 0700); err != nil {
		return "", fmt.Errorf("failed to create config directory: %w", err)
	}

	// Dosya yolu: ~/.binboi/config.yaml
	return filepath.Join(configDir, "config.yaml"), nil
}

// 💾 SaveToken: Kullanıcının terminalden girdiği token'ı dosyaya yazar
func SaveToken(token string) error {
	configPath, err := getConfigPath()
	if err != nil {
		return err
	}

	// Mevcut ayarları kaybetmemek için önce dosyayı oku (eğer varsa)
	cfg := BinboiConfig{}
	if fileBytes, err := os.ReadFile(configPath); err == nil {
		_ = yaml.Unmarshal(fileBytes, &cfg)
	}

	// Token'ı güncelle
	cfg.AuthToken = token

	// Struct'ı YAML formatına çevir
	yamlData, err := yaml.Marshal(&cfg)
	if err != nil {
		return fmt.Errorf("failed to encode config: %w", err)
	}

	// 🛡️ GÜVENLİK: Dosyayı sadece kullanıcının okuyabileceği şekilde (0600) yaz
	err = os.WriteFile(configPath, yamlData, 0600)
	if err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}

	fmt.Printf("✅ Auth token saved to: %s\n", configPath)
	return nil
}

// 🔍 LoadToken: Tünel başlatılırken dosyadan token'ı okur
func LoadToken() (string, error) {
	configPath, err := getConfigPath()
	if err != nil {
		return "", err
	}

	fileBytes, err := os.ReadFile(configPath)
	if err != nil {
		// Dosya yoksa veya okunamıyorsa kullanıcıyı uyar
		return "", fmt.Errorf("config file not found. Please run 'binboi login --token <token>' first")
	}

	var cfg BinboiConfig
	if err := yaml.Unmarshal(fileBytes, &cfg); err != nil {
		return "", fmt.Errorf("failed to parse config file: %w", err)
	}

	if cfg.AuthToken == "" {
		return "", fmt.Errorf("access token is empty in config file")
	}

	return cfg.AuthToken, nil
}
