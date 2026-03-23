package protocol

import (
	"encoding/json"
	"errors"
)

// Message Types
const (
	TypeHandshake    = "HANDSHAKE"
	TypeHandshakeAck = "HANDSHAKE_ACK"
	TypeData         = "DATA"
	TypePing         = "PING"
	TypeError        = "ERROR"
)

// Message is the main envelope for all communication
type Message struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload,omitempty"`
}

// HandshakePayload is the initial identification sent by the client
type HandshakePayload struct {
	Token         string `json:"token"`
	Subdomain     string `json:"subdomain"`
	LocalPort     int    `json:"local_port"`
	ClientVersion string `json:"version"`
}

// HandshakeResponse is the server's reply to the handshake
type HandshakeResponse struct {
	Status  string `json:"status"`  // "success" or "error"
	Message string `json:"message"` // Detailed info or welcome text
	URL     string `json:"url"`     // The assigned public URL (e.g., sazlab.binboi.com)
}

// Encode converts the message to a JSON byte slice
func (m *Message) Encode() ([]byte, error) {
	return json.Marshal(m)
}

// Decode parses the byte slice into a Message struct
func Decode(data []byte) (*Message, error) {
	var msg Message
	if err := json.Unmarshal(data, &msg); err != nil {
		return nil, errors.New("invalid message format")
	}
	return &msg, nil
}