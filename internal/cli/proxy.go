package cli

import (
	"bufio"
	"io"
	"net"
	"strconv"
	"strings"
	"sync"
	"time"
)

// countingWriter wraps an io.Writer and accumulates the total bytes written.
type countingWriter struct {
	io.Writer
	total int64
}

func (w *countingWriter) Write(p []byte) (int, error) {
	n, err := w.Writer.Write(p)
	w.total += int64(n)
	return n, err
}

// proxyHTTP transparently forwards one yamux stream (relay) ↔ local TCP port.
// It peeks at the first line of each direction to extract:
//   - HTTP method + path  (relay → local, i.e. the request)
//   - HTTP status code    (local → relay, i.e. the response)
//
// Byte counts and a RecentRequest entry are recorded in stats when done.
func proxyHTTP(relay, local net.Conn, stats *TunnelStats) {
	defer relay.Close()
	defer local.Close()

	start := time.Now()

	var (
		mu     sync.Mutex
		method string
		path   string
		status int
	)

	localW := &countingWriter{Writer: local}
	relayW := &countingWriter{Writer: relay}

	done := make(chan struct{}, 2)

	// relay → local: HTTP request direction.
	go func() {
		defer func() { done <- struct{}{} }()
		br := bufio.NewReader(relay)
		if line, err := br.ReadString('\n'); err == nil {
			if m, p, ok := parseRequestLine(line); ok {
				mu.Lock()
				method, path = m, p
				mu.Unlock()
			}
			localW.Write([]byte(line)) //nolint:errcheck
		}
		io.Copy(localW, br) //nolint:errcheck
	}()

	// local → relay: HTTP response direction.
	go func() {
		defer func() { done <- struct{}{} }()
		br := bufio.NewReader(local)
		if line, err := br.ReadString('\n'); err == nil {
			if code, ok := parseStatusLine(line); ok {
				mu.Lock()
				status = code
				mu.Unlock()
			}
			relayW.Write([]byte(line)) //nolint:errcheck
		}
		io.Copy(relayW, br) //nolint:errcheck
	}()

	// Wait for the first direction to finish, then close both connections so
	// the other goroutine unblocks from its blocked Read.
	<-done
	relay.Close()
	local.Close()
	<-done

	duration := time.Since(start)
	stats.BytesIn.Add(localW.total)
	stats.BytesOut.Add(relayW.total)

	mu.Lock()
	m, p, s := method, path, status
	mu.Unlock()

	if m != "" {
		stats.AddRequest(RecentRequest{
			Method:   m,
			Path:     p,
			Status:   s,
			Duration: duration,
			At:       start,
		})
	}
}

// parseRequestLine parses "GET /path HTTP/1.1" → method, path.
func parseRequestLine(line string) (method, path string, ok bool) {
	parts := strings.Fields(strings.TrimSpace(line))
	if len(parts) < 2 {
		return "", "", false
	}
	m := strings.ToUpper(parts[0])
	switch m {
	case "GET", "POST", "PUT", "PATCH", "DELETE",
		"HEAD", "OPTIONS", "CONNECT", "TRACE":
		p := parts[1]
		// Trim query string for display.
		if i := strings.IndexByte(p, '?'); i != -1 {
			p = p[:i]
		}
		return m, p, true
	}
	return "", "", false
}

// parseStatusLine parses "HTTP/1.1 200 OK" → status code.
func parseStatusLine(line string) (status int, ok bool) {
	parts := strings.Fields(strings.TrimSpace(line))
	if len(parts) < 2 || !strings.HasPrefix(parts[0], "HTTP/") {
		return 0, false
	}
	n, err := strconv.Atoi(parts[1])
	if err != nil {
		return 0, false
	}
	return n, true
}

// measurePing periodically measures TCP connection latency to the relay by
// establishing and immediately closing a fresh TCP connection.
// Results are written to stats via SetPing. Stops when stopCh is closed.
func measurePing(serverAddr string, stats *TunnelStats, stopCh <-chan struct{}) {
	dial := func() {
		t := time.Now()
		conn, err := net.DialTimeout("tcp", serverAddr, 3*time.Second)
		if err != nil {
			return
		}
		conn.Close()
		stats.SetPing(time.Since(t))
	}

	// Measure immediately on start.
	dial()

	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-stopCh:
			return
		case <-ticker.C:
			dial()
		}
	}
}
