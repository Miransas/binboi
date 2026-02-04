package main

import (
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("HTTPS çalışıyor 🔒"))
	})

	log.Println("HTTPS server on https://localhost:8443")
	log.Fatal(http.ListenAndServeTLS(
		":8443",
		"cert.pem",
		"key.pem",
		nil,
	))
}
