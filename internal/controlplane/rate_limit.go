package controlplane

import (
	"fmt"
	"math"
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

const staleRateLimitBucketAge = 15 * time.Minute

type requestRateLimiter struct {
	mu         sync.Mutex
	entries    map[string]*rateLimitBucket
	tokensPerS float64
	burst      float64
	now        func() time.Time
	hits       uint64
}

type rateLimitBucket struct {
	tokens   float64
	lastSeen time.Time
}

func newRequestRateLimiter(limitPerMinute, burst int) *requestRateLimiter {
	if limitPerMinute <= 0 || burst <= 0 {
		return nil
	}

	return &requestRateLimiter{
		entries:    make(map[string]*rateLimitBucket),
		tokensPerS: float64(limitPerMinute) / 60.0,
		burst:      float64(burst),
		now:        time.Now,
	}
}

func (l *requestRateLimiter) allow(subject string) (bool, time.Duration) {
	if l == nil {
		return true, 0
	}

	key := strings.TrimSpace(subject)
	if key == "" {
		key = "anonymous"
	}

	l.mu.Lock()
	defer l.mu.Unlock()

	now := l.now().UTC()
	bucket, ok := l.entries[key]
	if !ok {
		l.entries[key] = &rateLimitBucket{
			tokens:   math.Max(l.burst-1, 0),
			lastSeen: now,
		}
		l.cleanup(now)
		return true, 0
	}

	elapsed := now.Sub(bucket.lastSeen).Seconds()
	if elapsed > 0 {
		bucket.tokens = math.Min(l.burst, bucket.tokens+(elapsed*l.tokensPerS))
	}
	bucket.lastSeen = now

	if bucket.tokens >= 1 {
		bucket.tokens--
		l.cleanup(now)
		return true, 0
	}

	deficit := 1 - bucket.tokens
	retryAfter := time.Second
	if l.tokensPerS > 0 {
		retryAfter = time.Duration(math.Ceil(deficit/l.tokensPerS)) * time.Second
		if retryAfter < time.Second {
			retryAfter = time.Second
		}
	}
	l.cleanup(now)
	return false, retryAfter
}

func (l *requestRateLimiter) cleanup(now time.Time) {
	l.hits++
	if l.hits%128 != 0 {
		return
	}

	for key, bucket := range l.entries {
		if now.Sub(bucket.lastSeen) > staleRateLimitBucketAge {
			delete(l.entries, key)
		}
	}
}

func (s *Service) apiRateLimit(v1 bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		if s.apiLimiter == nil || isTrustedLocalRequest(c.Request) {
			c.Next()
			return
		}

		allowed, retryAfter := s.apiLimiter.allow(rateLimitSubject(c.Request))
		if allowed {
			c.Next()
			return
		}

		retryAfterSeconds := retryAfterSeconds(retryAfter)
		c.Header("Retry-After", strconv.Itoa(retryAfterSeconds))
		c.Header("X-RateLimit-Scope", "api")
		s.recordAPIRateLimited()

		if v1 {
			writeV1Error(
				c,
				http.StatusTooManyRequests,
				s.apiMeta(requestAccess{}),
				"RATE_LIMITED",
				fmt.Sprintf("too many control plane requests, retry in %d seconds", retryAfterSeconds),
			)
		} else {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":               "too many control plane requests",
				"retry_after_seconds": retryAfterSeconds,
			})
			return
		}

		c.Abort()
	}
}

func (s *Service) withProxyRateLimit(next http.Handler) http.Handler {
	if s.proxyLimiter == nil {
		return next
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		allowed, retryAfter := s.proxyLimiter.allow(rateLimitSubject(r))
		if allowed {
			next.ServeHTTP(w, r)
			return
		}

		retryAfterSeconds := retryAfterSeconds(retryAfter)
		w.Header().Set("Retry-After", strconv.Itoa(retryAfterSeconds))
		w.Header().Set("X-RateLimit-Scope", "proxy")
		s.recordProxyRateLimited()
		http.Error(w, "Too many public requests. Please retry shortly.", http.StatusTooManyRequests)
	})
}

func retryAfterSeconds(value time.Duration) int {
	if value <= 0 {
		return 1
	}
	seconds := int(math.Ceil(value.Seconds()))
	if seconds < 1 {
		return 1
	}
	return seconds
}

func rateLimitSubject(r *http.Request) string {
	token := extractBearerToken(r)
	if token != "" {
		return "token:" + compactPreview(token, 16)
	}

	host := clientIP(r)
	if host == "" {
		return "anonymous"
	}
	return "ip:" + host
}

func clientIP(r *http.Request) string {
	if r == nil {
		return ""
	}

	if forwarded := strings.TrimSpace(r.Header.Get("X-Forwarded-For")); forwarded != "" {
		parts := strings.Split(forwarded, ",")
		if candidate := strings.TrimSpace(parts[0]); candidate != "" {
			return candidate
		}
	}

	if realIP := strings.TrimSpace(r.Header.Get("X-Real-IP")); realIP != "" {
		return realIP
	}

	host, _, err := net.SplitHostPort(strings.TrimSpace(r.RemoteAddr))
	if err == nil {
		return host
	}
	return strings.TrimSpace(r.RemoteAddr)
}
