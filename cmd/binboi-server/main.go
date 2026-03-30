package main

import (
	"log"
	"net"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/miransas/binboi/internal/controlplane"
)

func main() {
	cfg := controlplane.LoadConfigFromEnv()

	service, err := controlplane.NewService(cfg)
	if err != nil {
		log.Fatalf("failed to initialize control plane: %v", err)
	}

	go func() {
		listener, err := net.Listen("tcp", cfg.TunnelAddr)
		if err != nil {
			log.Fatalf("failed to listen for tunnel agents on %s: %v", cfg.TunnelAddr, err)
		}
		log.Printf("tunnel listener ready on %s", cfg.TunnelAddr)

		for {
			conn, err := listener.Accept()
			if err != nil {
				log.Printf("tunnel accept error: %v", err)
				continue
			}
			go service.HandleTunnelConnection(conn)
		}
	}()

	go func() {
		log.Printf("public proxy listening on %s", cfg.ProxyAddr)
		if err := http.ListenAndServe(cfg.ProxyAddr, service.ServeProxy()); err != nil {
			log.Fatalf("proxy server failed: %v", err)
		}
	}()

	router := gin.New()
	service.RegisterRoutes(router)

	log.Printf("control plane API listening on %s", cfg.APIAddr)
	if err := router.Run(cfg.APIAddr); err != nil {
		log.Fatalf("api server failed: %v", err)
	}
}
