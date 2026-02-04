package protocol

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



//We're making HTTP portable.