package controlplane

import (
	"context"
	"crypto/tls"
	"errors"
	"net"
	"net/http"
	"strings"

	"golang.org/x/crypto/acme/autocert"
	"gorm.io/gorm"
)

func normalizeTLSHost(raw string) string {
	host := strings.ToLower(strings.TrimSpace(raw))
	if host == "" {
		return ""
	}
	if parsedHost, _, err := net.SplitHostPort(host); err == nil {
		host = parsedHost
	}
	return strings.TrimSuffix(host, ".")
}

func (s *Service) proxyTLSEnabled() bool {
	return strings.TrimSpace(s.cfg.ProxyTLSAddr) != ""
}

func (s *Service) tlsMode() string {
	if s.proxyTLSEnabled() {
		return "acme"
	}
	return "external-edge"
}

func (s *Service) configureTLSManager() {
	if !s.proxyTLSEnabled() {
		return
	}

	s.proxyTLSManager = &autocert.Manager{
		Prompt: autocert.AcceptTOS,
		Cache:  autocert.DirCache(fallbackString(strings.TrimSpace(s.cfg.ACMECacheDir), defaultACMECacheDir)),
		Email:  strings.TrimSpace(s.cfg.ACMEEmail),
		HostPolicy: func(ctx context.Context, host string) error {
			return s.allowACMEHost(ctx, host)
		},
	}
}

func (s *Service) allowACMEHost(ctx context.Context, host string) error {
	host = normalizeTLSHost(host)
	baseDomain := normalizeTLSHost(s.cfg.BaseDomain)
	if host == "" {
		return errors.New("missing host")
	}

	if host == baseDomain || strings.HasSuffix(host, "."+baseDomain) {
		return nil
	}

	var record DomainRecord
	err := s.db.WithContext(ctx).
		Where("name = ? AND status = ?", host, "VERIFIED").
		First(&record).
		Error
	if err == nil {
		return nil
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return errors.New("host is not a verified Binboi domain")
	}
	return err
}

func (s *Service) ProxyHTTPHandler() http.Handler {
	handler := s.ServeProxy()
	if s.proxyTLSManager == nil {
		return handler
	}
	return s.proxyTLSManager.HTTPHandler(handler)
}

func (s *Service) ProxyTLSConfig() *tls.Config {
	if s.proxyTLSManager == nil {
		return nil
	}

	config := s.proxyTLSManager.TLSConfig()
	if config == nil {
		return nil
	}
	config.MinVersion = tls.VersionTLS12
	return config
}
