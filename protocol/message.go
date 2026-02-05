package protocol
import "encoding/json"



type Request struct {
	ID     string
	Method string
	Path   string
	Header map[string]string
	Body   []byte
}

type Response struct {
	ID         string
	StatusCode int
	Header     map[string]string
	Body       []byte
}
type MessageType string

const (
	MsgHello   MessageType = "hello"
	MsgRequest MessageType = "request"
	MsgResponse MessageType = "response"
	MsgPing     MessageType = "ping"
)

type Envelope struct {
	Type MessageType     `json:"type"`
	Data json.RawMessage `json:"data"`
}
type TunnelMessage struct {
	ID      string      `json:"id"`
	Type    MessageType`json:"type"`
	Method  string      `json:"method,omitempty"`
	Path    string      `json:"path,omitempty"`
	Headers map[string]string `json:"headers,omitempty"`
	Body    []byte      `json:"body,omitempty"`
	Status  int         `json:"status,omitempty"`
}




//We're making HTTP portable.