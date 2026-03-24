package server

import (
	"io"
	"net"
)

// Relay: İki net.Conn arasındaki veri akışını yönetir
func Relay(remote, local net.Conn) {
	defer remote.Close()
	defer local.Close()

	done := make(chan struct{}, 2)

	go func() {
		io.Copy(remote, local)
		done <- struct{}{}
	}()

	go func() {
		io.Copy(local, remote)
		done <- struct{}{}
	}()

	<-done
}