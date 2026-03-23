package proxy


import (
	"io"
	"net"
)

// Join connects two TCP connections and pipes data between them
func Join(c1, c2 net.Conn) {
	defer c1.Close()
	defer c2.Close()

	// Bidirectional copy
	go io.Copy(c1, c2)
	io.Copy(c2, c1)
}