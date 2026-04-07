package controlplane

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type HealthStatusResponse struct {
	Status string `json:"status"`
}

type OperatorSnapshotResponse struct {
	Status               string                `json:"status"`
	GeneratedAt          time.Time             `json:"generated_at"`
	Health               HealthStatusResponse  `json:"health"`
	Instance             InstanceResponse      `json:"instance"`
	Readiness            ReadinessResponse     `json:"readiness"`
	Metrics              MetricsSnapshot       `json:"metrics"`
	Limits               QuotaSnapshot         `json:"limits"`
	RecentCriticalEvents []EventResponse       `json:"recent_critical_events"`
	TunnelSummary        OperatorTunnelSummary `json:"tunnel_summary"`
}

func (s *Service) operatorSnapshot(ctx context.Context, access requestAccess) (OperatorSnapshotResponse, int, error) {
	if ctx == nil {
		ctx = context.Background()
	}

	readiness, readinessStatus := s.readinessResponse(ctx)
	metrics, err := s.metricsSnapshot()
	if err != nil {
		return OperatorSnapshotResponse{}, http.StatusInternalServerError, err
	}
	limits, err := s.quotaSnapshot(ctx, access)
	if err != nil {
		return OperatorSnapshotResponse{}, http.StatusInternalServerError, err
	}
	recentEvents, err := s.recentCriticalEvents(access, defaultOperatorRecentCriticalEventLimit)
	if err != nil {
		return OperatorSnapshotResponse{}, http.StatusInternalServerError, err
	}
	tunnelSummary, err := s.operatorTunnelSummary(access, defaultOperatorRecentTunnelLimit)
	if err != nil {
		return OperatorSnapshotResponse{}, http.StatusInternalServerError, err
	}

	return OperatorSnapshotResponse{
		Status:      readiness.Status,
		GeneratedAt: time.Now().UTC(),
		Health: HealthStatusResponse{
			Status: "ok",
		},
		Instance:             s.instanceResponse(),
		Readiness:            readiness,
		Metrics:              metrics,
		Limits:               limits,
		RecentCriticalEvents: recentEvents,
		TunnelSummary:        tunnelSummary,
	}, readinessStatus, nil
}

func (s *Service) handleOperatorSnapshot(c *gin.Context) {
	access := currentRequestAccess(c)
	snapshot, status, err := s.operatorSnapshot(c.Request.Context(), access)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to build operator snapshot"})
		return
	}
	c.JSON(status, snapshot)
}

func (s *Service) handleV1OperatorSnapshot(c *gin.Context) {
	access := currentRequestAccess(c)
	meta := s.apiMeta(access)
	snapshot, status, err := s.operatorSnapshot(c.Request.Context(), access)
	if err != nil {
		writeV1Error(c, http.StatusInternalServerError, meta, "SNAPSHOT_BUILD_FAILED", "failed to build operator snapshot")
		return
	}
	writeV1Success(c, status, meta, snapshot)
}
