package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// 📦 Binboi Tünel Mesaj Protokolü (Core ve CLI bu dilde anlaşır)
type TunnelMessage struct {
	ReqID   string            `json:"req_id"`
	Type    string            `json:"type"` // "request" veya "response"
	Method  string            `json:"method,omitempty"`
	Path    string            `json:"path,omitempty"`
	Headers map[string]string `json:"headers,omitempty"`
	Body    []byte            `json:"body,omitempty"`
	Status  int               `json:"status,omitempty"`
}

// WriteMutex: WebSocket'e aynı anda iki goroutine yazmaya çalışırsa çökmesin diye kilit
var writeMutex sync.Mutex

// 🚀 StartRelay: Core'dan gelen WebSocket trafiğini dinler ve localhost'a iletir
func StartRelay(ws *websocket.Conn, localPort int) {
	for {
		// 1. Core'dan gelen mesajı bekle (Bloke edici)
		_, msgBytes, err := ws.ReadMessage()
		if err != nil {
			fmt.Println("\n🔴 [DISCONNECTED] Connection to Binboi Core lost.")
			break
		}

		// 2. Mesajı JSON'dan Struct'a çevir
		var msg TunnelMessage
		if err := json.Unmarshal(msgBytes, &msg); err != nil {
			continue // Hatalı paketleri atla
		}

		// 3. Eğer gelen bir HTTP isteğiyse, yeni bir Go Routine başlat (Asenkron)
		if msg.Type == "request" {
			go handleLocalRequest(ws, msg, localPort)
		}
	}
}

// 🎯 handleLocalRequest: İsteği localhost'a atar ve cevabı geri döndürür
func handleLocalRequest(ws *websocket.Conn, reqMsg TunnelMessage, localPort int) {
	start := time.Now()
	
	// 1. Hedef URL'i oluştur (Örn: http://localhost:3000/api/users)
	localURL := fmt.Sprintf("http://localhost:%d%s", localPort, reqMsg.Path)

	// 2. Localhost'a atılacak HTTP isteğini hazırla
	req, err := http.NewRequest(reqMsg.Method, localURL, bytes.NewReader(reqMsg.Body))
	if err != nil {
		sendErrorResponse(ws, reqMsg.ReqID, 500, "Binboi Agent Internal Error")
		return
	}

	// Orijinal Header'ları kopyala
	for k, v := range reqMsg.Headers {
		req.Header.Set(k, v)
	}

	// 3. İsteği ateşle (30 saniye timeout)
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	
	if err != nil {
		// Localhost kapalıysa 502 Bad Gateway dön
		sendErrorResponse(ws, reqMsg.ReqID, 502, "502 Bad Gateway: Local server refused connection")
		LogRequest(reqMsg.Method, reqMsg.Path, 502, time.Since(start).String()) // ui.go'daki log fonksiyonumuz
		return
	}
	defer resp.Body.Close()

	// 4. Localhost'tan dönen yanıtı (Body ve Headers) oku
	respBody, _ := io.ReadAll(resp.Body)
	respHeaders := make(map[string]string)
	for k, v := range resp.Header {
		respHeaders[k] = v[0] // Sadeliği korumak için ilk header değerini alıyoruz
	}

	// 5. Yanıtı Binboi Protokolüne paketle
	respMsg := TunnelMessage{
		ReqID:   reqMsg.ReqID,
		Type:    "response",
		Status:  resp.StatusCode,
		Headers: respHeaders,
		Body:    respBody,
	}

	// 6. WebSocket üzerinden Binboi Core'a (Uzak Sunucuya) fırlat
	respBytes, _ := json.Marshal(respMsg)
	
	writeMutex.Lock()
	ws.WriteMessage(websocket.TextMessage, respBytes)
	writeMutex.Unlock()

	// 7. Terminaldeki şık log ekranımızı güncelle
	LogRequest(reqMsg.Method, reqMsg.Path, resp.StatusCode, time.Since(start).String())
}

// 🛡️ sendErrorResponse: Localhost kapalıysa Core sunucusuna hızlıca hata döner
func sendErrorResponse(ws *websocket.Conn, reqID string, status int, errorMsg string) {
	respMsg := TunnelMessage{
		ReqID:  reqID,
		Type:   "response",
		Status: status,
		Body:   []byte(errorMsg),
	}
	respBytes, _ := json.Marshal(respMsg)
	
	writeMutex.Lock()
	ws.WriteMessage(websocket.TextMessage, respBytes)
	writeMutex.Unlock()
}