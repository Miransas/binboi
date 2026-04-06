package main

import (
	"context"
	"errors"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
	"github.com/miransas/binboi/internal/controlplane"
)

func main() {
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})))

	rootCtx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	cfg := controlplane.LoadConfigFromEnv()

	service, err := controlplane.NewService(cfg)
	if err != nil {
		slog.Error("failed to initialize control plane", "error", err)
		os.Exit(1)
	}

	router := gin.New()
	service.RegisterRoutes(router)

	apiServer := &http.Server{
		Addr:              cfg.APIAddr,
		Handler:           router,
		ReadHeaderTimeout: cfg.ReadHeaderTimeout,
		ReadTimeout:       cfg.ReadTimeout,
		WriteTimeout:      cfg.WriteTimeout,
		IdleTimeout:       cfg.IdleTimeout,
	}

	proxyServer := &http.Server{
		Addr:              cfg.ProxyAddr,
		Handler:           service.ServeProxy(),
		ReadHeaderTimeout: cfg.ReadHeaderTimeout,
		ReadTimeout:       cfg.ReadTimeout,
		WriteTimeout:      cfg.WriteTimeout,
		IdleTimeout:       cfg.IdleTimeout,
	}

	tunnelListener, err := net.Listen("tcp", cfg.TunnelAddr)
	if err != nil {
		slog.Error("failed to listen for tunnel agents", "addr", cfg.TunnelAddr, "error", err)
		os.Exit(1)
	}

	slog.Info("binboi control plane ready", "tunnel_addr", cfg.TunnelAddr, "proxy_addr", cfg.ProxyAddr, "api_addr", cfg.APIAddr)

	runErrCh := make(chan error, 3)

	go serveTunnelListener(rootCtx, tunnelListener, service, runErrCh)
	go serveHTTP("proxy", proxyServer, runErrCh)
	go serveHTTP("api", apiServer, runErrCh)

	var runErr error
	select {
	case <-rootCtx.Done():
		slog.Info("shutdown requested", "reason", rootCtx.Err())
	case err := <-runErrCh:
		runErr = err
		slog.Error("server error", "error", err)
	}

	stop()

	shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()

	if err := shutdownRuntime(shutdownCtx, tunnelListener, apiServer, proxyServer, service); err != nil {
		slog.Error("shutdown completed with errors", "error", err)
		if runErr == nil {
			runErr = err
		}
	}

	if runErr != nil && !errors.Is(runErr, context.Canceled) {
		slog.Error("binboi server stopped with error", "error", runErr)
		os.Exit(1)
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
