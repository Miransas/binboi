package controlplane

import (
	"context"
	"errors"
	"strings"
)

var (
	errRequestReplayBodyTruncated = errors.New("request body exceeds the configured capture limit and cannot be replayed")
	errRequestReplayNested        = errors.New("replayed requests cannot be replayed again")
	errRequestReplayLimitReached  = errors.New("request replay limit reached for this captured request")
)

func (s *Service) requestReplayLimit() int {
	if s.cfg.RequestReplayLimit > 0 {
		return s.cfg.RequestReplayLimit
	}
	return defaultRequestReplayLimit
}

func (s *Service) replayCountForRequest(ctx context.Context, access requestAccess, requestID string) (int64, error) {
	var count int64
	err := s.requestRecordQuery(ctx, access).
		Where("request_records.replay_of_request_id = ?", strings.TrimSpace(requestID)).
		Count(&count).
		Error
	return count, err
}

func (s *Service) nextReplayAttempt(ctx context.Context, access requestAccess, requestID string) (int64, error) {
	count, err := s.replayCountForRequest(ctx, access, requestID)
	if err != nil {
		return 0, err
	}
	return count + 1, nil
}

func (s *Service) ensureReplayEligible(ctx context.Context, access requestAccess, record RequestRecord, archive RequestArchiveRecord) error {
	if strings.TrimSpace(record.ReplayOfRequestID) != "" {
		return errRequestReplayNested
	}
	if archive.RequestBodyTruncated {
		return errRequestReplayBodyTruncated
	}
	if err := s.enforceReplayQuota(ctx, access); err != nil {
		return err
	}
	if limit := s.requestReplayLimit(); limit > 0 {
		count, err := s.replayCountForRequest(ctx, access, record.ID)
		if err != nil {
			return err
		}
		if count >= int64(limit) {
			return errRequestReplayLimitReached
		}
	}
	return nil
}

func isReplayBlockedError(err error) bool {
	return errors.Is(err, errRequestReplayBodyTruncated) ||
		errors.Is(err, errRequestReplayNested) ||
		errors.Is(err, errRequestReplayLimitReached)
}
