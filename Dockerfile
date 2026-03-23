FROM golang:1.21-alpine AS builder
WORKDIR /app

# 1. Bunu ekle (Proxy desteği sağlar)
ENV GOPROXY=https://proxy.golang.org,direct

COPY go.mod go.sum ./

# 2. Hata burada kopuyor, --network=host ile çalıştırmayı deneyebilirsin
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o binboi-server cmd/binboi-server/main.go