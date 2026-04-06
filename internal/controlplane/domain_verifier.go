package controlplane

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"
)

func (s *Service) startBackgroundWorkers() {
	if s.cfg.DomainVerifyInterval <= 0 {
		return
	}

	ctx, cancel := context.WithCancel(context.Background())
	s.backgroundCancel = cancel
	s.backgroundWG.Add(1)
	go s.runPendingDomainVerifier(ctx)
}

func (s *Service) runPendingDomainVerifier(ctx context.Context) {
	defer s.backgroundWG.Done()

	run := func() {
		err := s.verifyPendingDomains(ctx)
		s.recordDomainVerifierRun(err)
		if err != nil && !errors.Is(err, context.Canceled) {
			s.logRuntimeEvent(slog.LevelWarn, "pending domain verification cycle failed", "error", err)
		}
	}

	run()

	ticker := time.NewTicker(s.domainVerifyInterval())
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			run()
		}
	}
}

func (s *Service) domainVerifyInterval() time.Duration {
	if s.cfg.DomainVerifyInterval > 0 {
		return s.cfg.DomainVerifyInterval
	}
	return defaultDomainVerifyInterval
}

func (s *Service) domainVerifyBatchSize() int {
	if s.cfg.DomainVerifyBatchSize > 0 {
		return s.cfg.DomainVerifyBatchSize
	}
	return defaultDomainVerifyBatchSize
}

func (s *Service) domainLookupTimeout() time.Duration {
	if s.cfg.DomainLookupTimeout > 0 {
		return s.cfg.DomainLookupTimeout
	}
	return defaultDomainLookupTimeout
}

func (s *Service) verifyPendingDomains(ctx context.Context) error {
	if ctx == nil {
		ctx = context.Background()
	}

	var records []DomainRecord
	if err := s.db.
		Where("type = ? AND status = ?", "CUSTOM", "PENDING").
		Order("COALESCE(last_verification_check_at, created_at) asc").
		Limit(s.domainVerifyBatchSize()).
		Find(&records).
		Error; err != nil {
		return err
	}

	for _, record := range records {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		updated, changed, err := s.refreshDomainVerification(ctx, record)
		if err != nil {
			return err
		}
		if changed && updated.Status == "VERIFIED" {
			s.writeEvent(EventRecord{
				Level:        "info",
				Message:      fmt.Sprintf("Verified custom domain %s", updated.Name),
				OwnerUserID:  updated.OwnerUserID,
				OwnerEmail:   updated.OwnerEmail,
				AccessScope:  "system",
				Action:       "domain.verify",
				ResourceType: "domain",
				ResourceID:   updated.Name,
				DetailsJSON: marshalEventDetails(map[string]any{
					"status":      updated.Status,
					"verified_at": formatTime(updated.VerifiedAt),
					"auto":        true,
				}),
			}, true)
		}
	}

	return nil
}

func (s *Service) refreshDomainVerification(ctx context.Context, record DomainRecord) (DomainRecord, bool, error) {
	if record.Type == "MANAGED" {
		return record, false, nil
	}

	if ctx == nil {
		ctx = context.Background()
	}

	lookupCtx, cancel := context.WithTimeout(ctx, s.domainLookupTimeout())
	defer cancel()

	now := time.Now().UTC()
	txtRecords, err := s.lookupTXT(lookupCtx, record.Name)
	if err != nil {
		record.LastVerificationCheckAt = &now
		record.LastVerificationError = compactPreview(err.Error(), 180)
		if saveErr := s.db.Save(&record).Error; saveErr != nil {
			return DomainRecord{}, false, saveErr
		}
		return record, false, nil
	}

	matched := false
	for _, txtRecord := range txtRecords {
		if strings.Contains(txtRecord, record.ExpectedTXT) {
			matched = true
			break
		}
	}

	record.LastVerificationCheckAt = &now
	record.LastVerificationError = ""
	changed := false
	if matched {
		record.Status = "VERIFIED"
		record.VerifiedAt = &now
		record.ExpectedTXT = ""
		changed = true
	} else {
		record.LastVerificationError = "verification TXT record not found"
	}

	if err := s.db.Save(&record).Error; err != nil {
		return DomainRecord{}, false, err
	}

	return record, changed, nil
}

func (s *Service) domainResponse(record DomainRecord) DomainResponse {
	return DomainResponse{
		Name:                    record.Name,
		Type:                    record.Type,
		Status:                  record.Status,
		ExpectedTXT:             record.ExpectedTXT,
		VerifiedAt:              record.VerifiedAt,
		LastVerificationCheckAt: record.LastVerificationCheckAt,
		LastVerificationError:   record.LastVerificationError,
		TLSReady:                record.Status == "VERIFIED",
		TLSMode:                 s.tlsMode(),
	}
}
