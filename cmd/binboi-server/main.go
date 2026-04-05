package main

import (
	"context"
	"errors"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/miransas/binboi/internal/controlplane"
)

const (
	readHeaderTimeout = 10 * time.Second
	readTimeout       = 30 * time.Second
	writeTimeout      = 60 * time.Second
	idleTimeout       = 90 * time.Second
	shutdownTimeout   = 10 * time.Second
)

func main() {
	rootCtx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	cfg := controlplane.LoadConfigFromEnv()

	service, err := controlplane.NewService(cfg)
	if err != nil {
		log.Fatalf("failed to initialize control plane: %v", err)
	}

	router := gin.New()
	service.RegisterRoutes(router)

	apiServer := &http.Server{
		Addr:              cfg.APIAddr,
		Handler:           router,
		ReadHeaderTimeout: readHeaderTimeout,
		ReadTimeout:       readTimeout,
		WriteTimeout:      writeTimeout,
		IdleTimeout:       idleTimeout,
	}

	proxyServer := &http.Server{
		Addr:              cfg.ProxyAddr,
		Handler:           service.ServeProxy(),
		ReadHeaderTimeout: readHeaderTimeout,
		ReadTimeout:       readTimeout,
		WriteTimeout:      writeTimeout,
		IdleTimeout:       idleTimeout,
	}

	tunnelListener, err := net.Listen("tcp", cfg.TunnelAddr)
	if err != nil {
		log.Fatalf("failed to listen for tunnel agents on %s: %v", cfg.TunnelAddr, err)
	}

	log.Printf("tunnel listener ready on %s", cfg.TunnelAddr)
	log.Printf("public proxy listening on %s", cfg.ProxyAddr)
	log.Printf("control plane API listening on %s", cfg.APIAddr)

	runErrCh := make(chan error, 3)

	go serveTunnelListener(rootCtx, tunnelListener, service, runErrCh)
	go serveHTTP("proxy", proxyServer, runErrCh)
	go serveHTTP("api", apiServer, runErrCh)

	var runErr error
	select {
	case <-rootCtx.Done():
		log.Printf("shutdown requested: %v", rootCtx.Err())
	case err := <-runErrCh:
		runErr = err
		log.Printf("server error: %v", err)
	}

	stop()

	shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()

	if err := shutdownRuntime(shutdownCtx, tunnelListener, apiServer, proxyServer, service); err != nil {
		log.Printf("shutdown completed with errors: %v", err)
		if runErr == nil {
			runErr = err
		}
	}

	if runErr != nil && !errors.Is(runErr, context.Canceled) {
		log.Fatalf("binboi server stopped with error: %v", runErr)
	}
}

func serveHTTP(name string, server *http.Server, errCh chan<- error) {
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		errCh <- errors.New(name + " server: " + err.Error())
	}
}

func serveTunnelListener(ctx context.Context, listener net.Listener, service *controlplane.Service, errCh chan<- error) {
	for {
		conn, err := listener.Accept()
		if err != nil {
			if ctx.Err() != nil || errors.Is(err, net.ErrClosed) {
				return
			}
			errCh <- errors.New("tunnel listener: " + err.Error())
			return
		}
		go service.HandleTunnelConnection(conn)
	}
}

func shutdownRuntime(
	ctx context.Context,
	tunnelListener net.Listener,
	apiServer *http.Server,
	proxyServer *http.Server,
	service *controlplane.Service,
) error {
	var shutdownErr error

	if tunnelListener != nil {
		shutdownErr = errors.Join(shutdownErr, tunnelListener.Close())
	}
	if apiServer != nil {
		shutdownErr = errors.Join(shutdownErr, apiServer.Shutdown(ctx))
	}
	if proxyServer != nil {
		shutdownErr = errors.Join(shutdownErr, proxyServer.Shutdown(ctx))
	}
	if service != nil {
		shutdownErr = errors.Join(shutdownErr, service.Close(ctx))
	}

	return shutdownErr
}
