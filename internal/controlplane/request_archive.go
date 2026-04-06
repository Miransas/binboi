package controlplane

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

type RequestArchiveRecord struct {
	RequestID             string `gorm:"primaryKey"`
	RequestHeadersJSON    string `gorm:"type:text"`
	ResponseHeadersJSON   string `gorm:"type:text"`
	RequestBody           []byte `gorm:"type:blob"`
	RequestBodyTruncated  bool
	ResponseBody          []byte `gorm:"type:blob"`
	ResponseBodyTruncated bool
	CreatedAt             time.Time
	UpdatedAt             time.Time
}

func headersToJSON(header http.Header) string {
	if len(header) == 0 {
		return ""
	}
	clone := make(map[string][]string, len(header))
	for key, values := range header {
		clone[key] = append([]string(nil), values...)
	}
	encoded, err := json.Marshal(clone)
	if err != nil {
		return ""
	}
	return string(encoded)
}

func headersFromJSON(raw string) http.Header {
	if strings.TrimSpace(raw) == "" {
		return make(http.Header)
	}

	var decoded map[string][]string
	if err := json.Unmarshal([]byte(raw), &decoded); err != nil {
		return make(http.Header)
	}

	header := make(http.Header, len(decoded))
	for key, values := range decoded {
		header[key] = append([]string(nil), values...)
	}
	return header
}

func (s *Service) upsertRequestArchive(requestID string, observed requestObservation) error {
	if strings.TrimSpace(requestID) == "" {
		return nil
	}

	record := RequestArchiveRecord{
		RequestID:             requestID,
		RequestHeadersJSON:    observed.RequestHeadersJSON,
		ResponseHeadersJSON:   observed.ResponseHeadersJSON,
		RequestBody:           append([]byte(nil), observed.RequestBody...),
		RequestBodyTruncated:  observed.RequestBodyTruncated,
		ResponseBody:          append([]byte(nil), observed.ResponseBody...),
		ResponseBodyTruncated: observed.ResponseBodyTruncated,
	}

	return s.db.Save(&record).Error
}
