ppackage config

import (
    "fmt"
    "log"
    "strings"

    "github.com/spf13/pflag"
    "github.com/spf13/viper"
)

type Config struct {
    Port     int    `mapstructure:"port"`
    LogLevel string `mapstructure:"log_level"`
    // diğer ayarlar buraya eklenebilir
}

func LoadConfig() (*Config, error) {
    viper.SetConfigName("config")     // config.yaml / config.toml / config.json
    viper.SetConfigType("yaml")       // veya toml/json
    viper.AddConfigPath(".")          // current directory
    viper.AddConfigPath("./config")   // config/ klasörü
    viper.AddConfigPath("/etc/elasiyanetwork/")

    // Environment variables desteği (örneğin ELASIYA_PORT=9000)
    viper.AutomaticEnv()
    viper.SetEnvPrefix("elasiya")
    viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

    // Komut satırı flag'leri
    pflag.Int("port", 8080, "Server port")
    pflag.String("log-level", "info", "Log level (debug, info, warn, error)")
    pflag.Parse()
    viper.BindPFlags(pflag.CommandLine)

    // Config dosyasını oku
    if err := viper.ReadInConfig(); err != nil {
        if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
            return nil, fmt.Errorf("config okuma hatası: %w", err)
        }
        // config dosyası yoksa varsayılanları kullan (sorun değil)
        log.Println("Config dosyası bulunamadı, varsayılan değerler kullanılıyor")
    }

    var cfg Config
    if err := viper.Unmarshal(&cfg); err != nil {
        return nil, fmt.Errorf("config parse hatası: %w", err)
    }

    // Varsayılan değerler
    if cfg.Port == 0 {
        cfg.Port = 8080
    }
    if cfg.LogLevel == "" {
        cfg.LogLevel = "info"
    }

    return &cfg, nil
}
