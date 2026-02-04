# local app
python3 -m http.server 3000

# server
go run ./server

# client
go run ./client --subdomain abc --port 3000

# test
curl http://abc.localhost:8080
