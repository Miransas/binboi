package server

import (
	"io"
	"net"
	"context"
	
	"sync/atomic"
	"github.com/miransas/binboi/internal/db"
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

// RelayWithCounter: Veriyi taşırken aynı zamanda miktarını sayar ve DB'ye yazar
func RelayWithCounter(remote, local net.Conn, subdomain string, store *db.TunnelStore) {
	defer remote.Close()
	defer local.Close()

	var totalBytes int64
	done := make(chan struct{}, 2)

	// Local -> Remote (Upload)
	go func() {
		n, _ := io.Copy(remote, local)
		atomic.AddInt64(&totalBytes, n)
		done <- struct{}{}
	}()

	// Remote -> Local (Download)
	go func() {
		n, _ := io.Copy(local, remote)
		atomic.AddInt64(&totalBytes, n)
		done <- struct{}{}
	}()

	// İki taraflı kopyalama bitene kadar bekle
	<-done
	<-done

	// Transfer bittiğinde veritabanını güncelle
	if totalBytes > 0 {
		store.IncrementBandwidth(context.Background(), subdomain, totalBytes)
	}
}