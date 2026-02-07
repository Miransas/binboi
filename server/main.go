package main

import (
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/connect", handleClientConnect)
	http.HandleFunc("/dashboard", handleDashboard)
	http.HandleFunc("/", handleHTTP)
	http.HandleFunc("/disconnect", handleDisconnect)
	headers := http.Header{}
	headers.Set("Authorization", "Bearer "+getAPIToken())
    

	log.Println("Server listening on :9090")
	log.Fatal(http.ListenAndServe(":9090", nil))
}
