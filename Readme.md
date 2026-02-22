# 🌐 Elasiya Network

**Elasiya** is an open-source, ngrok-like HTTP tunnel written in Go. It exposes your local services to the internet instantly — no configuration needed.

<div align="center">
  <a href="https://t.me/azsams" target="_blank">
    <img src="https://github.com/sardorazimov/elasiyanetwork/blob/main/assets/banner.png?raw=true" alt="Elasiya Banner">
  </a>
</div>

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Installation](#-installation)
3. [Quick Start](#-quick-start)
4. [Usage Guide](#-usage-guide)
5. [Running the Server](#-running-the-server)
6. [Project Structure](#-project-structure)
7. [Contributing](#-contributing)
8. [License](#-license)

---

## 🚀 Features

- **Instant tunnels** – expose any local port with one command (`elasiya http 3000`)
- **WebSocket-based** – efficient, low-latency bidirectional communication
- **Auto-reconnect** – client reconnects automatically on drop
- **Concurrent requests** – handles multiple simultaneous HTTP requests per tunnel
- **Token auth** – simple token-based access control
- **Dashboard** – built-in web dashboard at `/dashboard`
- **Self-hostable** – run your own server with a single binary

---

## 📦 Installation

### Option 1 — Homebrew (macOS / Linux)

```bash
brew tap sardorazimov/elasiya
brew install elasiya
```

### Option 2 — apt (Debian / Ubuntu)

```bash
curl -fsSL https://raw.githubusercontent.com/sardorazimov/elasiyanetwork/main/install.sh | sudo bash
```

Or add the apt repository:

```bash
sudo apt update
sudo apt install elasiya
```

### Option 3 — Go install

```bash
go install github.com/sardorazimov/elasiyanetwork/cmd/elasiya@latest
```

> Make sure `$GOPATH/bin` (usually `~/go/bin`) is in your `$PATH`.

### Option 4 — Build from source

```bash
# Clone the repository
git clone https://github.com/sardorazimov/elasiyanetwork.git
cd elasiyanetwork

# Download dependencies
go mod download

# Build the client CLI
go build -o elasiya ./cmd/elasiya

# Build the server
go build -o elasiya-server ./cmd/elasiya-server

# (optional) Move to PATH
sudo mv elasiya /usr/local/bin/
sudo mv elasiya-server /usr/local/bin/
```

### Option 5 — Quick install script

```bash
curl -fsSL https://raw.githubusercontent.com/sardorazimov/elasiyanetwork/main/install.sh | bash
```

---

## ⚡ Quick Start

1. Start the server (or use a hosted Elasiya server):

```bash
elasiya-server
# Server listening on :8080
```

2. In another terminal, expose your local service:

```bash
# Expose localhost:3000
elasiya http 3000

# Output:
#   🚇 Elasiya Tunnel  v1.0.0
#   ─────────────────────────────────────────
#   Server   ws://localhost:8080
#   Tunnel   http://localhost:8080/ela-ela_fre  →  http://localhost:3000
#   ─────────────────────────────────────────
#   Press Ctrl+C to stop
```

---

## 📖 Usage Guide

### Client — `elasiya`

```
elasiya [options] <command> [args]

COMMANDS:
  http <port>   Expose a local HTTP service on <port>
  version       Print version and exit

OPTIONS:
  --server string   Elasiya server WebSocket address
                    Default: ws://localhost:8080
                    Env:     ELASIYA_SERVER

  --token  string   Auth token
                    Default: ela_free_test
                    Env:     ELASIYA_TOKEN

  --host   string   Custom tunnel hostname (optional)
```

#### Examples

```bash
# Expose port 3000 with default settings
elasiya http 3000

# Use a remote server
elasiya http 3000 --server ws://tunnel.elasiya.network

# Use a custom token
elasiya http 8080 --token my-secret-token

# Custom host name
elasiya http 3000 --host myapp

# Use environment variables
export ELASIYA_SERVER=ws://tunnel.elasiya.network
export ELASIYA_TOKEN=my-secret-token
elasiya http 3000

# Print version
elasiya version
```

### Server — `elasiya-server`

```bash
# Start server on default port 8080
elasiya-server

# Override token via environment variable
ELASIYA_TOKEN=my-secret-token elasiya-server
```

The server exposes:

| Endpoint      | Description                                    |
|---------------|------------------------------------------------|
| `/tunnel`     | WebSocket endpoint for client tunnel handshake |
| `/<anything>` | Proxies incoming HTTP requests to the tunnel   |

---

## 🐳 Docker

```bash
# Build the image
docker build -t elasiyanetwork:latest .

# Run the server
docker run -d -p 8080:8080 --name elasiya-server elasiyanetwork:latest

# Run with a custom token
docker run -d -p 8080:8080 -e ELASIYA_TOKEN=my-token --name elasiya-server elasiyanetwork:latest

# Using Docker Compose
docker compose up -d --build
```

---

## 📂 Project Structure

```
.
├── cmd/
│   ├── elasiya/           # Client CLI entry point
│   └── elasiya-server/    # Server entry point
├── internal/
│   ├── auth/              # Token verification
│   ├── server/            # HTTP proxy + WebSocket handler
│   └── tunnel/            # Tunnel registry
├── protocol/              # Shared message types
├── install.sh             # Quick-install script
├── Dockerfile             # Multi-stage Docker build
├── go.mod
└── LICENSE
```

---

## 📸 Architecture

```
Internet
   │
   ▼
elasiya-server (:8080)
   │  WebSocket /tunnel
   ├──────────────────────► elasiya client (your machine)
   │                              │
   │  HTTP request arrives        │ forward to localhost:<port>
   │  server sends to client ─────┘
   │  client returns response
   │  server writes HTTP response
   ▼
Caller gets response
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the project
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

Copyright © 2026 Sardor Azimov
