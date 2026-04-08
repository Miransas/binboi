package controlplane

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
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

	acmeHandler := s.proxyTLSManager.HTTPHandler(http.NotFoundHandler())
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if isACMEChallengeRequest(r) {
			acmeHandler.ServeHTTP(w, r)
			return
		}

		http.Redirect(w, r, s.redirectHTTPSURL(r), http.StatusPermanentRedirect)
	})
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

func isACMEChallengeRequest(r *http.Request) bool {
	if r == nil {
		return false
	}
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		return false
	}
	return strings.HasPrefix(r.URL.Path, "/.well-known/acme-challenge/")
}

func (s *Service) redirectHTTPSURL(r *http.Request) string {
	host := normalizeTLSHost(r.Host)
	if host == "" {
		host = normalizeTLSHost(s.cfg.BaseDomain)
	}

	requestURI := "/"
	if r != nil && r.URL != nil {
		requestURI = r.URL.RequestURI()
		if requestURI == "" {
			requestURI = "/"
		}
	}

	port := s.cfg.PublicPort
	if port <= 0 {
		port = resolvedPublicPort("https", s.cfg.ProxyAddr, s.cfg.ProxyTLSAddr)
	}
	if port == 443 {
		return fmt.Sprintf("https://%s%s", host, requestURI)
	}
	return fmt.Sprintf("https://%s:%d%s", host, port, requestURI)
}

func (s *Service) forwardedProtoForRequest(r *http.Request) string {
	if proto := forwardedProtoFromHeaders(r); proto != "" {
		return proto
	}
	if r != nil && r.TLS != nil {
		return "https"
	}
	return resolvePublicScheme(s.cfg.PublicScheme, s.cfg.ProxyTLSAddr)
}

func (s *Service) forwardedPortForRequest(r *http.Request, proto string) string {
	if r != nil {
		if headerPort := forwardedPortFromHeaders(r); headerPort != "" {
			return headerPort
		}
		if _, port, err := net.SplitHostPort(strings.TrimSpace(r.Host)); err == nil && port != "" {
			return port
		}
	}

	return fmt.Sprintf("%d", resolvedPublicPort(proto, s.cfg.ProxyAddr, s.cfg.ProxyTLSAddr))
}

func forwardedProtoFromHeaders(r *http.Request) string {
	if r == nil {
		return ""
	}

	if proto := firstForwardedValue(r.Header.Get("X-Forwarded-Proto")); proto == "http" || proto == "https" {
		return proto
	}

	forwarded := strings.TrimSpace(r.Header.Get("Forwarded"))
	if forwarded == "" {
		return ""
	}

	firstEntry := strings.TrimSpace(strings.Split(forwarded, ",")[0])
	for _, part := range strings.Split(firstEntry, ";") {
		key, value, ok := strings.Cut(strings.TrimSpace(part), "=")
		if !ok || !strings.EqualFold(key, "proto") {
			continue
		}
		proto := strings.ToLower(strings.Trim(strings.TrimSpace(value), `"`))
		if proto == "http" || proto == "https" {
			return proto
		}
	}

	return ""
}

func forwardedPortFromHeaders(r *http.Request) string {
	if r == nil {
		return ""
	}
	return firstForwardedValue(r.Header.Get("X-Forwarded-Port"))
}

func firstForwardedValue(raw string) string {
	value := strings.ToLower(strings.TrimSpace(strings.Split(raw, ",")[0]))
	return strings.Trim(value, `"`)
}
