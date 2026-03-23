package utils

import (
	"os"
	"gopkg.in/yaml.v3"
)

type Config struct {
	Server struct {
		Addr  string `yaml:"addr"`
		Token string `yaml:"token"`
	} `yaml:"server"`
	Client struct {
		RemoteAddr string `yaml:"remote_addr"`
		LocalPort  int    `yaml:"local_port"`
		Subdomain  string `yaml:"subdomain"`
		Token      string `yaml:"token"`
	} `yaml:"client"`
}

func LoadConfig(path string) (*Config, error) {
	buf, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var cfg Config
	err = yaml.Unmarshal(buf, &cfg)
	return &cfg, err
}