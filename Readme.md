🚀 Binboi — Neural Tunneling Core
Binboi is a high-performance, neural-themed tunneling service written in Go. It allows you to expose your local environment to the global network instantly through encrypted neural links. Powered by the Miransas ecosystem.

<div align="center">
<img src="https://github.com/sardorazimov/binboi/blob/main/assets/neural-banner.png?raw=true" alt="Binboi Banner" width="800">
<p><i>"Expose your local world to the neural network."</i></p>
</div>

📋 [SYSTEM_MANIFEST]
Features

Installation

Neural Authentication

Quick Start

Dashboard

Architecture

License

⚡ Features
Neural Links – Instant HTTP tunnels with a single command (binboi start 3000).

Yamux Powered – Multiplexed streams over a single TCP connection for extreme efficiency.

Cyber-Dashboard – Next.js 16 powered, dark-mode-only management console.

Live Neural Stream – Real-time request logging via WebSockets.

DNS Verification – Support for custom domains via automated DNS TXT checks.

AI Gateways – Smart traffic inspection and neural shielding (Alpha).

📦 Installation
Go Install (Recommended)
Bash
go install github.com/miransas/binboi/cmd/binboi@latest
Build from Source
Bash
# Clone the repository
git clone https://github.com/miransas/binboi.git
cd binboi

# Build the Neural Core (Server)
go build -o binboi-server ./cmd/binboi-server

# Build the CLI (Client)
go build -o binboi ./cmd/binboi
🔑 Authentication
Before starting a tunnel, you must link your local machine to the Miransas network:

Go to the Binboi Dashboard.

Copy your Neural Access Token.

Run the following command:

Bash
binboi auth binboi_live_YOUR_TOKEN_HERE
🧪 Quick Start
1. Fire up the Core (Server-side)
Bash
./binboi-server
# 🚀 Binboi Core Running on :8080
# 📡 [PROXY_GATEWAY]: Intercepting traffic on :8000
2. Initiate a Link (Client-side)
Bash
binboi start 3000

# Output:
#  🚇 [NEURAL_LINK_ESTABLISHED]
#  ─────────────────────────────────────────
#  Endpoint:  http://asardor.binboi.link:8000
#  Target:    http://localhost:3000
#  ─────────────────────────────────────────
🖥️ Dashboard
Binboi comes with a state-of-the-art management console built with Next.js 16 and Tailwind CSS v4.

Traffic Inspector: Watch incoming requests in real-time with Matrix-style logs.

Domain Manager: Link your own domains (e.g., api.miransas.com) via DNS verification.

Security Hub: Revoke all active sessions and rotate neural keys instantly.

📂 Project Structure
.
├── cmd/
│   ├── binboi/            # Client CLI (The "Agent")
│   └── binboi-server/     # Core Server (The "Relay")
├── internal/
│   ├── auth/              # Neural Token validation
│   ├── db/                # Postgres & Tunnel registry
│   ├── protocol/          # Yamux & Binary handshake
│   └── server/            # Gin API + Reverse Proxy
├── web/                   # Next.js 16 Dashboard
└── go.mod
📄 License
MIT License — see LICENSE for details.

Copyright © 2026 Sardor Azimov / Miransas.