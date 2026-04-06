package controlplane

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"gorm.io/gorm"
)

type planQuota struct {
	Plan               string
	MaxReservedTunnels int
	MaxActiveTunnels   int
	MaxCustomDomains   int
	MaxRequestsPerDay  int
	MaxRequestHistory  int
	RequestRetention   time.Duration
	EventRetention     time.Duration
}

func normalizePlanName(raw string) string {
	switch strings.ToUpper(strings.TrimSpace(raw)) {
	case "SCALE":
		return "SCALE"
	case "PRO":
		return "PRO"
	default:
		return "FREE"
	}
}

func quotaForPlan(plan string) planQuota {
	switch normalizePlanName(plan) {
	case "SCALE":
		return planQuota{
			Plan:               "SCALE",
			MaxReservedTunnels: 100,
			MaxActiveTunnels:   100,
			MaxCustomDomains:   100,
			MaxRequestsPerDay:  0,
			MaxRequestHistory:  0,
			RequestRetention:   90 * 24 * time.Hour,
			EventRetention:     90 * 24 * time.Hour,
		}
	case "PRO":
		return planQuota{
			Plan:               "PRO",
			MaxReservedTunnels: 25,
			MaxActiveTunnels:   25,
			MaxCustomDomains:   25,
			MaxRequestsPerDay:  10000,
			MaxRequestHistory:  0,
			RequestRetention:   30 * 24 * time.Hour,
			EventRetention:     30 * 24 * time.Hour,
		}
	default:
		return planQuota{
			Plan:               "FREE",
			MaxReservedTunnels: 1,
			MaxActiveTunnels:   1,
			MaxCustomDomains:   0,
			MaxRequestsPerDay:  100,
			MaxRequestHistory:  50,
			RequestRetention:   time.Hour,
			EventRetention:     time.Hour,
		}
	}
}

func previewQuota() planQuota {
	return planQuota{
		Plan:               "PREVIEW",
		MaxReservedTunnels: 3,
		MaxActiveTunnels:   3,
		MaxCustomDomains:   3,
		MaxRequestsPerDay:  1000,
		MaxRequestHistory:  200,
		RequestRetention:   24 * time.Hour,
		EventRetention:     24 * time.Hour,
	}
}

func quotaForAccess(access requestAccess) planQuota {
	if access.Identity != nil {
		return quotaForPlan(access.Identity.Plan)
	}
	if access.TrustedLocal {
		return previewQuota()
	}
	return quotaForPlan("FREE")
}

func (s *Service) quotaForTunnel(ctx context.Context, tunnel TunnelRecord) (planQuota, error) {
	if strings.EqualFold(tunnel.AuthMode, "instance-token-preview") || strings.TrimSpace(tunnel.OwnerUserID) == "" {
		return previewQuota(), nil
	}
	if s.authProvider == nil || !s.authProvider.Enabled() {
		return previewQuota(), nil
	}

	plan, err := s.authProvider.LookupUserPlan(ctx, tunnel.OwnerUserID)
	if err != nil {
		return planQuota{}, err
	}
	return quotaForPlan(plan), nil
}

func isQuotaError(err error) bool {
	if err == nil {
		return false
	}
	return strings.Contains(strings.ToLower(err.Error()), "plan limit")
}

func quotaError(format string, args ...any) error {
	return errors.New(fmt.Sprintf(format, args...))
}

func planQuotaStatus(err error, fallback int) int {
	if isQuotaError(err) {
		return http.StatusForbidden
	}
	return fallback
}

func (s *Service) enforceTunnelReservationQuota(access requestAccess) error {
	quota := quotaForAccess(access)
	if quota.MaxReservedTunnels <= 0 {
		return nil
	}

	var count int64
	query := s.db.Model(&TunnelRecord{})
	if access.Identity != nil && s.authProvider != nil && s.authProvider.Enabled() {
		query = query.Where("owner_user_id = ?", access.Identity.UserID)
	}
	if err := query.Count(&count).Error; err != nil {
		return err
	}
	if count >= int64(quota.MaxReservedTunnels) {
		return quotaError("%s plan limit reached: up to %d reserved tunnels are allowed", quota.Plan, quota.MaxReservedTunnels)
	}
	return nil
}

func (s *Service) enforceActiveTunnelQuota(identity *AuthIdentity, subdomain string) error {
	if identity == nil {
		return nil
	}

	quota := quotaForPlan(identity.Plan)
	if quota.MaxActiveTunnels <= 0 {
		return nil
	}

	var count int64
	query := s.db.Model(&TunnelRecord{}).
		Where("owner_user_id = ? AND status = ?", identity.UserID, "ACTIVE")
	if trimmed := strings.TrimSpace(subdomain); trimmed != "" {
		query = query.Where("subdomain <> ?", trimmed)
	}
	if err := query.Count(&count).Error; err != nil {
		return err
	}
	if count >= int64(quota.MaxActiveTunnels) {
		return quotaError("%s plan limit reached: up to %d active tunnels are allowed", quota.Plan, quota.MaxActiveTunnels)
	}
	return nil
}

func (s *Service) enforceCustomDomainQuota(access requestAccess) error {
	quota := quotaForAccess(access)
	if quota.MaxCustomDomains <= 0 {
		return quotaError("%s plan limit reached: custom domains are not included", quota.Plan)
	}

	var count int64
	query := s.db.Model(&DomainRecord{}).Where("type = ?", "CUSTOM")
	if access.Identity != nil && s.authProvider != nil && s.authProvider.Enabled() {
		query = query.Where("owner_user_id = ?", access.Identity.UserID)
	}
	if err := query.Count(&count).Error; err != nil {
		return err
	}
	if count >= int64(quota.MaxCustomDomains) {
		return quotaError("%s plan limit reached: up to %d custom domains are allowed", quota.Plan, quota.MaxCustomDomains)
	}
	return nil
}

func (s *Service) enforceRequestQuota(tunnel TunnelRecord) error {
	quota, err := s.quotaForTunnel(context.Background(), tunnel)
	if err != nil || quota.MaxRequestsPerDay <= 0 {
		return err
	}

	var count int64
	startOfDay := time.Now().UTC().Truncate(24 * time.Hour)
	query := s.db.Model(&RequestRecord{}).
		Where("request_records.created_at >= ?", startOfDay)

	if strings.TrimSpace(tunnel.OwnerUserID) != "" {
		query = query.Joins("JOIN tunnel_records ON tunnel_records.id = request_records.tunnel_id").
			Where("tunnel_records.owner_user_id = ?", tunnel.OwnerUserID)
	} else {
		query = query.Where("tunnel_id = ?", tunnel.ID)
	}

	if err := query.Count(&count).Error; err != nil {
		return err
	}
	if count >= int64(quota.MaxRequestsPerDay) {
		return quotaError("%s plan limit reached: up to %d requests per day are allowed", quota.Plan, quota.MaxRequestsPerDay)
	}
	return nil
}

func (s *Service) applyAccessRetentionWindow(query *gorm.DB, access requestAccess, column string, requestFeed bool) *gorm.DB {
	if query == nil || access.Identity == nil {
		return query
	}

	quota := quotaForPlan(access.Identity.Plan)
	window := quota.EventRetention
	if requestFeed {
		window = quota.RequestRetention
	}
	if window <= 0 {
		return query
	}

	return query.Where(column+" >= ?", time.Now().UTC().Add(-window))
}
