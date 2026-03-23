# Stage 1: Build the Go binary
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o binboi-server cmd/binboi-server/main.go

# Stage 2: Final lightweight image
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/binboi-server .
# Port 80 and 8080 for tunnel and router
EXPOSE 80 8080
CMD ["./binboi-server"]