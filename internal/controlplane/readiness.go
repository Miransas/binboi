package controlplane

import (
	"context"
	"net/http"
	"time"
)

type workerReadinessState struct {
	LastRunAt     *time.Time
	LastSuccessAt *time.Time
	LastError     string
	RunCount      uint64
}

type ReadinessCheck struct {
	Status        string     `json:"status"`
	Message       string     `json:"message,omitempty"`
	LastCheckedAt time.Time  `json:"last_checked_at"`
	LastRunAt     *time.Time `json:"last_run_at,omitempty"`
	LastSuccessAt *time.Time `json:"last_success_at,omitempty"`
}

type ReadinessResponse struct {
	Ready         bool                      `json:"ready"`
	Status        string                    `json:"status"`
	StartedAt     time.Time                 `json:"started_at"`
	UptimeSeconds int64                     `json:"uptime_seconds"`
	Checks        map[string]ReadinessCheck `json:"checks"`
}

func (s *Service) recordDomainVerifierRun(err error) {
	now := time.Now().UTC()

	s.workerMu.Lock()
	defer s.workerMu.Unlock()

	s.domainVerifierState.LastRunAt = &now
	s.domainVerifierState.RunCount++
	if err == nil {
		s.domainVerifierState.LastSuccessAt = &now
		s.domainVerifierState.LastError = ""
		return
	}

	s.domainVerifierState.LastError = err.Error()
}

func (s *Service) currentDomainVerifierState() workerReadinessState {
	s.workerMu.RLock()
	defer s.workerMu.RUnlock()

	state := s.domainVerifierState
	if state.LastRunAt != nil {
		lastRun := *state.LastRunAt
		state.LastRunAt = &lastRun
	}
	if state.LastSuccessAt != nil {
		lastSuccess := *state.LastSuccessAt
		state.LastSuccessAt = &lastSuccess
	}
	return state
}

func (s *Service) readinessResponse(ctx context.Context) (ReadinessResponse, int) {
	if ctx == nil {
		ctx = context.Background()
	}

	now := time.Now().UTC()
	checks := map[string]ReadinessCheck{}
	coreFailed := false
	degraded := false

	sqlCheck := ReadinessCheck{
		Status:        "ok",
		Message:       "sqlite control plane store is reachable",
		LastCheckedAt: now,
	}
	if s.db == nil {
		sqlCheck.Status = "error"
		sqlCheck.Message = "sqlite control plane store is not configured"
		coreFailed = true
	} else if sqlDB, err := s.db.DB(); err != nil {
		sqlCheck.Status = "error"
		sqlCheck.Message = "sqlite handle is unavailable: " + err.Error()
		coreFailed = true
	} else if err := sqlDB.PingContext(ctx); err != nil {
		sqlCheck.Status = "error"
		sqlCheck.Message = "sqlite ping failed: " + err.Error()
		coreFailed = true
	}
	checks["sqlite"] = sqlCheck

	authCheck := ReadinessCheck{
		Status:        "disabled",
		Message:       "postgres auth provider is not configured",
		LastCheckedAt: now,
	}
	if s.authProvider != nil && s.authProvider.Enabled() {
		authCheck.Status = "ok"
		authCheck.Message = "postgres auth provider is reachable"
		if err := s.authProvider.HealthCheck(ctx); err != nil {
			authCheck.Status = "error"
			authCheck.Message = "postgres auth provider ping failed: " + err.Error()
			coreFailed = true
		}
	}
	checks["auth"] = authCheck

	tlsCheck := ReadinessCheck{
		Status:        "external",
		Message:       "TLS is expected to terminate at an external edge",
		LastCheckedAt: now,
	}
	if s.proxyTLSEnabled() {
		tlsCheck.Status = "ok"
		tlsCheck.Message = "ACME TLS listener is configured on " + fallbackString(s.cfg.ProxyTLSAddr, defaultProxyTLSAddr)
		if s.proxyTLSManager == nil {
			tlsCheck.Status = "error"
			tlsCheck.Message = "ACME TLS listener is enabled but the certificate manager is unavailable"
			coreFailed = true
		}
	}
	checks["tls"] = tlsCheck

	domainCheck := ReadinessCheck{
		Status:        "disabled",
		Message:       "background domain verifier is disabled",
		LastCheckedAt: now,
	}
	if s.domainVerifyInterval() > 0 {
		state := s.currentDomainVerifierState()
		domainCheck.LastRunAt = state.LastRunAt
		domainCheck.LastSuccessAt = state.LastSuccessAt
		domainCheck.Status = "starting"
		domainCheck.Message = "background domain verifier has not completed its first run yet"

		if state.LastRunAt != nil {
			domainCheck.Status = "ok"
			domainCheck.Message = "background domain verifier is healthy"

			staleAfter := s.domainVerifyInterval() * 3
			if staleAfter <= 0 {
				staleAfter = defaultDomainVerifyInterval * 3
			}

			if time.Since(*state.LastRunAt) > staleAfter {
				domainCheck.Status = "degraded"
				domainCheck.Message = "background domain verifier has not reported recently"
			}

			if state.LastError != "" {
				domainCheck.Status = "degraded"
				domainCheck.Message = "background domain verifier last error: " + state.LastError
			}
		}

		if domainCheck.Status == "starting" || domainCheck.Status == "degraded" {
			degraded = true
		}
	}
	checks["domain_verifier"] = domainCheck

	status := "ok"
	httpStatus := http.StatusOK
	ready := true
	if coreFailed {
		status = "error"
		httpStatus = http.StatusServiceUnavailable
		ready = false
	} else if degraded {
		status = "degraded"
	}

	return ReadinessResponse{
		Ready:         ready,
		Status:        status,
		StartedAt:     s.startedAt,
		UptimeSeconds: int64(time.Since(s.startedAt).Seconds()),
		Checks:        checks,
	}, httpStatus
}
