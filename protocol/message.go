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
)

type Envelope struct {
	Type MessageType     `json:"type"`
	Data json.RawMessage `json:"data"`
}




//We're making HTTP portable.