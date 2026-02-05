package server

import (
	"log"
	"net/http"
)

func Start() {
	http.HandleFunc("/tunnel", TunnelWS)
	http.HandleFunc("/", ProxyHandler)

	log.Println("Elasiya server listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
