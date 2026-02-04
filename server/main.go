package main

import (
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/connect", handleClientConnect)
	http.HandleFunc("/", handleHTTP)

	log.Println("Server listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}