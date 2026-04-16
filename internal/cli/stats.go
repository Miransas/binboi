package cli

import (
	"sync"
	"sync/atomic"
	"time"
)

// RecentRequest holds info about one proxied HTTP exchange.
type RecentRequest struct {
	Method   string
	Path     string
	Status   int
	Duration time.Duration
	At       time.Time
}

// TunnelStats tracks live metrics for an active tunnel session.
// All fields are safe for concurrent use.
type TunnelStats struct {
	Requests atomic.Int64 // total streams proxied
	Errors   atomic.Int64 // streams with status >= 500 or no response
	BytesIn  atomic.Int64 // relay → local (request bytes)
	BytesOut atomic.Int64 // local → relay (response bytes)

	startTime time.Time
	pingNs    atomic.Int64 // relay TCP round-trip, nanoseconds (0 = not yet measured)

	mu     sync.Mutex
	recent []RecentRequest // ring, newest at the end, max recentCap entries
}

const recentCap = 8

func NewTunnelStats() *TunnelStats {
	return &TunnelStats{startTime: time.Now()}
}

func (s *TunnelStats) AddRequest(r RecentRequest) {
	s.Requests.Add(1)
	if r.Status == 0 || r.Status >= 500 {
		s.Errors.Add(1)
	}
	s.mu.Lock()
	s.recent = append(s.recent, r)
	if len(s.recent) > recentCap {
		s.recent = s.recent[len(s.recent)-recentCap:]
	}
	s.mu.Unlock()
}

// Recent returns a copy of the log, oldest-first, newest last.
func (s *TunnelStats) Recent() []RecentRequest {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make([]RecentRequest, len(s.recent))
	copy(out, s.recent)
	return out
}

func (s *TunnelStats) Uptime() time.Duration {
	return time.Since(s.startTime).Truncate(time.Second)
}

func (s *TunnelStats) SetPing(d time.Duration) {
	s.pingNs.Store(d.Nanoseconds())
}

func (s *TunnelStats) Ping() time.Duration {
	ns := s.pingNs.Load()
	if ns == 0 {
		return 0
	}
	return time.Duration(ns)
}

// AvgDuration returns the average request duration across all recent entries,
// or 0 if there are none.
func (s *TunnelStats) AvgDuration() time.Duration {
	s.mu.Lock()
	defer s.mu.Unlock()
	if len(s.recent) == 0 {
		return 0
	}
	var total time.Duration
	for _, r := range s.recent {
		total += r.Duration
	}
	return total / time.Duration(len(s.recent))
}
