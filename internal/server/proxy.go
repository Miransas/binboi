package server

import (
	"fmt"

	"net/http"
	"strings"
	"time"
)

func StartHTTPRouter(addr string) {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// 📝 Detailed Request Logging
		startTime := time.Now()
		defer func() {
			fmt.Printf("📝 [HTTP] %s %s | %s | %v\n",
				r.Method, r.URL.Path, r.RemoteAddr, time.Since(startTime))
		}()

		hostParts := strings.Split(r.Host, ".")
		subdomain := hostParts[0]

		mu.RLock()
		session, ok := Sessions[subdomain]
		mu.RUnlock()

		if !ok {
			http.Error(w, "Tunnel not found", http.StatusNotFound)
			return
		}

		stream, err := session.Mux.Open()
		if err != nil {
			http.Error(w, "Tunnel stream error", http.StatusServiceUnavailable)
			return
		}
		defer stream.Close()

		r.Write(stream)

		hj, ok := w.(http.Hijacker)
		if !ok {
			http.Error(w, "Hijacking not supported", http.StatusInternalServerError)
			return
		}
		conn, _, _ := hj.Hijack()
		Relay(stream, conn)
	})

	fmt.Printf("🌐 [ROUTER] Listening on %s\n", addr)
	http.ListenAndServe(addr, nil)
}
