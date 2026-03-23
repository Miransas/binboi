package main

import (
	"fmt"
	"net"
	"github.com/miransas/binboi/internal/server"
)

func main() {
	// Start Public HTTP Router in background
	go server.StartHTTPRouter(":80")

	// Start Tunnel Listener (where clients connect)
	listener, err := net.Listen("tcp", ":8080")
	if err != nil {
		panic(err)
	}

	fmt.Println("🏗️  Miransas Binboi Server listening on :8080")

	for {
		conn, err := listener.Accept()
		if err != nil {
			continue
		}
		go server.HandleClient(conn)
	}
}