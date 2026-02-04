package protocol

type Request struct {
	İD string
	Method string
	Path string
	Header map[string]string
	Body []byte
}

type Response  struct{
	İD  string
	Status int
	Header map[string]string
	Body []byte
}

//We're making HTTP portable.