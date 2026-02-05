// Basit bir control + data multiplexing mantığı
package main

import (
    "fmt"
   
    "net/http"
    
)

func main() {
    // Public server tarafı
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        // Buraya client'tan gelen bağlantıyı yönlendir
        fmt.Fprintln(w, "Merhaba ngrok benzeri!")
    })
    go http.ListenAndServe(":8080", nil)

    // Client tarafı (senin local makinen)
    // public server'a bağlan, local portu dinle ve trafiği tünelle
}
cfg, err := config.LoadConfig()
if err != nil {
    log.Fatal(err)
}

log.Printf("Server %d portunda başlıyor, log level: %s", cfg.Port, cfg.LogLevel)
// server'ı cfg.Port ile başlat