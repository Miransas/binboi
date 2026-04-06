package controlplane

import (
	"bytes"
	"compress/gzip"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

var errExportTooLarge = errors.New("export payload exceeds max bytes")

func (s *Service) writeExportResponse(c *gin.Context, contentType, filename string, body []byte) {
	if err := s.validateExportPayload(body); err != nil {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{
			"error":     "export payload exceeds maximum size",
			"limit":     s.exportMaxBytes(),
			"suggested": "reduce limit or narrow filters",
		})
		return
	}

	c.Header("Cache-Control", "no-store")
	c.Header("Content-Disposition", `attachment; filename="`+filename+`"`)
	c.Header("Vary", appendVaryValue(c.Writer.Header().Get("Vary"), "Accept-Encoding"))
	c.Header("X-Binboi-Export-Bytes", fmt.Sprintf("%d", len(body)))

	if acceptsGzip(c.Request) {
		compressed, err := gzipExportPayload(body)
		if err == nil {
			c.Header("Content-Encoding", "gzip")
			c.Header("X-Binboi-Export-Compression", "gzip")
			c.Data(http.StatusOK, contentType, compressed)
			return
		}
	}

	c.Data(http.StatusOK, contentType, body)
}

func (s *Service) validateExportPayload(body []byte) error {
	limit := s.exportMaxBytes()
	if limit > 0 && len(body) > limit {
		return fmt.Errorf("%w: %d > %d", errExportTooLarge, len(body), limit)
	}
	return nil
}

func acceptsGzip(r *http.Request) bool {
	for _, value := range strings.Split(r.Header.Get("Accept-Encoding"), ",") {
		if strings.EqualFold(strings.TrimSpace(strings.SplitN(value, ";", 2)[0]), "gzip") {
			return true
		}
	}
	return false
}

func gzipExportPayload(body []byte) ([]byte, error) {
	var compressed bytes.Buffer
	writer := gzip.NewWriter(&compressed)
	if _, err := writer.Write(body); err != nil {
		_ = writer.Close()
		return nil, err
	}
	if err := writer.Close(); err != nil {
		return nil, err
	}
	return compressed.Bytes(), nil
}

func appendVaryValue(existing, value string) string {
	existing = strings.TrimSpace(existing)
	value = strings.TrimSpace(value)
	if existing == "" {
		return value
	}
	for _, part := range strings.Split(existing, ",") {
		if strings.EqualFold(strings.TrimSpace(part), value) {
			return existing
		}
	}
	return existing + ", " + value
}
