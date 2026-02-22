package tunnel

import "sync"

type ClientTunnel struct {
	UserID    string
	Conn      any // *websocket.Conn
	Responses map[string]chan []byte
	Mu        sync.Mutex
}

var tunnels = make(map[string]*ClientTunnel)
var mu sync.Mutex

func Register(host string, t *ClientTunnel) {
	mu.Lock()
	defer mu.Unlock()
	tunnels[host] = t
}

func Unregister(host string) {
	mu.Lock()
	defer mu.Unlock()
	delete(tunnels, host)
}

func Get(host string) (*ClientTunnel, bool) {
	mu.Lock()
	defer mu.Unlock()
	t, ok := tunnels[host]
	return t, ok
}
