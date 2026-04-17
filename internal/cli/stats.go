package cli

import (
	"sort"
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
	Requests   atomic.Int64 // total streams proxied
	Errors     atomic.Int64 // streams with status >= 500 or no response
	BytesIn    atomic.Int64 // relay → local (request bytes)
	BytesOut   atomic.Int64 // local → relay (response bytes)
	LastActive atomic.Int64 // unix nanos of last completed request (0 = none)

	startTime time.Time
	pingNs    atomic.Int64 // relay TCP round-trip, nanoseconds (0 = not yet measured)

	mu     sync.Mutex
	recent []RecentRequest // ring, newest at the end, max recentCap entries

	dmu       sync.Mutex
	durations []time.Duration // ring for percentile calculation, max durationsCap entries
}

const recentCap = 8
const durationsCap = 128

func NewTunnelStats() *TunnelStats {
	return &TunnelStats{startTime: time.Now()}
}

func (s *TunnelStats) AddRequest(r RecentRequest) {
	s.Requests.Add(1)
	if r.Status == 0 || r.Status >= 500 {
		s.Errors.Add(1)
	}
	s.LastActive.Store(r.At.UnixNano())

	s.mu.Lock()
	s.recent = append(s.recent, r)
	if len(s.recent) > recentCap {
		s.recent = s.recent[len(s.recent)-recentCap:]
	}
	s.mu.Unlock()

	s.dmu.Lock()
	s.durations = append(s.durations, r.Duration)
	if len(s.durations) > durationsCap {
		s.durations = s.durations[len(s.durations)-durationsCap:]
	}
	s.dmu.Unlock()
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

// LastActiveTime returns the time of the last completed request, or the zero
// value if no requests have been proxied yet.
func (s *TunnelStats) LastActiveTime() time.Time {
	ns := s.LastActive.Load()
	if ns == 0 {
		return time.Time{}
	}
	return time.Unix(0, ns)
}

// Percentile returns the p-th percentile of recent request durations (e.g.
// p=0.50 for median, p=0.90 for p90). Returns 0 if no data is available.
func (s *TunnelStats) Percentile(p float64) time.Duration {
	s.dmu.Lock()
	if len(s.durations) == 0 {
		s.dmu.Unlock()
		return 0
	}
	cp := make([]time.Duration, len(s.durations))
	copy(cp, s.durations)
	s.dmu.Unlock()

	sort.Slice(cp, func(i, j int) bool { return cp[i] < cp[j] })
	idx := int(float64(len(cp)-1) * p)
	return cp[idx]
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
