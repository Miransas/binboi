package server

import (
	"net"
	"sync"
	"github.com/hashicorp/yamux"
)

// Session represents an active tunnel connection
type Session struct {
	Conn      net.Conn
	Mux       *yamux.Session
	Subdomain string
}

var (
	// Sessions maps subdomain names to active Mux sessions
	Sessions = make(map[string]*Session)
	mu       sync.RWMutex
)