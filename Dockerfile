FROM golang:1.21-alpine AS builder
WORKDIR /app

RUN apk add --no-cache build-base

ENV GOPROXY=https://proxy.golang.org,direct

COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 GOOS=linux go build -o /bin/binboi-server ./cmd/binboi-server

FROM alpine:3.21
WORKDIR /app
COPY --from=builder /bin/binboi-server /usr/local/bin/binboi-server
EXPOSE 8000 8080 8081
ENTRYPOINT ["binboi-server"]
