FROM golang:1.25.6-alpine AS builder
WORKDIR /app

RUN apk add --no-cache build-base git ca-certificates

ENV GOPROXY=https://proxy.golang.org,direct

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build -ldflags="-s -w" -o /bin/binboi-server ./cmd/binboi-server

FROM alpine:3.21
WORKDIR /app

RUN apk add --no-cache ca-certificates curl && \
    addgroup -S binboi && adduser -S binboi -G binboi

COPY --from=builder /bin/binboi-server /usr/local/bin/binboi-server

EXPOSE 8000 8080 8081

USER binboi

ENTRYPOINT ["/usr/local/bin/binboi-server"]