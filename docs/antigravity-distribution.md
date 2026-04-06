# Antigravity Distribution Protocol

This document is generated from `binboi.json` and `manifest.json` for the Binboi release channel.

- Version: 0.4.0
- Maintainer: Sardor Azimov
- Organization: Miransas
- Repository: https://github.com/Miransas/binboi

Runtime defaults:

- API port: 8080
- Tunnel port: 8081
- Proxy port: 8000
- Web port: 3000

Verification:

```bash
binboi version
binboi whoami
```

## package.json (NPM)

**Miransas Verified**

Path: `packaging/npm/package.json`

```json
{
  "name": "@miransas/binboi",
  "version": "0.4.0",
  "description": "Self-hosted tunneling platform with a Go control plane, CLI agent, and Next.js product app.",
  "license": "MIT",
  "author": "Sardor Azimov",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Miransas/binboi.git"
  },
  "homepage": "https://github.com/Miransas/binboi#readme",
  "bugs": {
    "url": "https://github.com/Miransas/binboi/issues"
  },
  "publishConfig": {
    "access": "public"
  },
  "engines": {
    "node": ">=20"
  },
  "os": [
    "darwin",
    "linux"
  ],
  "cpu": [
    "x64",
    "arm64"
  ],
  "bin": {
    "binboi": "./bin/binboi.cjs"
  },
  "files": [
    "README.md",
    "bin",
    "scripts"
  ],
  "scripts": {
    "postinstall": "node ./scripts/postinstall.cjs",
    "verify-install": "node ./scripts/verify.cjs"
  },
  "keywords": [
    "binboi",
    "tunnel",
    "webhook",
    "proxy",
    "cli",
    "miransas"
  ],
  "miransas": {
    "verified": true,
    "organization": "Miransas",
    "maintainer": "Sardor Azimov",
    "nodeRequirement": "20+",
    "runtime": {
      "commands": {
        "server": "go run ./cmd/binboi-server",
        "cli": "go build -o binboi ./cmd/binboi-client",
        "web": "cd web && npm run dev"
      },
      "defaultPorts": {
        "api": 8080,
        "tunnel": 8081,
        "proxy": 8000,
        "web": 3000
      }
    },
    "endpoints": {
      "dashboardUrl": "http://127.0.0.1:3000/dashboard",
      "publicDashboardUrl": "http://127.0.0.1:3000/dashboard",
      "apiBaseUrl": "http://127.0.0.1:8080",
      "proxyBaseUrl": "http://binboi.localhost:8000",
      "health": "/api/v1/health",
      "metrics": "/metrics"
    }
  }
}
```

## Cargo.toml (Rust)

**Miransas Verified**

Path: `rust/Cargo.toml`

```toml
[package]
name = "miransas-binboi"
version = "0.4.0"
edition = "2021"
license = "MIT"
description = "Self-hosted tunneling platform with a Go control plane, CLI agent, and Next.js product app."
readme = "README.md"
repository = "https://github.com/Miransas/binboi"
homepage = "https://github.com/Miransas/binboi"
authors = ["Sardor Azimov"]
keywords = ["binboi", "tunnel", "webhook", "proxy", "cli"]
categories = ["command-line-utilities", "development-tools"]
build = "build.rs"

[package.metadata.miransas]
verified = true
organization = "Miransas"
maintainer = "Sardor Azimov"
release_notes = "https://github.com/Miransas/binboi/releases"
dashboard_url = "http://127.0.0.1:3000/dashboard"
api_base_url = "http://127.0.0.1:8080"
proxy_base_url = "http://binboi.localhost:8000"
health_endpoint = "/api/v1/health"
metrics_endpoint = "/metrics"
server_command = "go run ./cmd/binboi-server"
cli_command = "go build -o binboi ./cmd/binboi-client"
web_command = "cd web && npm run dev"
api_port = 8080
tunnel_port = 8081
proxy_port = 8000
web_port = 3000
supported_platforms = ["darwin/amd64", "darwin/arm64", "linux/amd64", "linux/arm64"]

[[bin]]
name = "binboi"
path = "src/main.rs"
```

## pyproject.toml (Python)

**Miransas Verified**

Path: `packaging/python/pyproject.toml`

```toml
[build-system]
requires = ["setuptools>=69", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "binboi"
version = "0.4.0"
description = "Self-hosted tunneling platform with a Go control plane, CLI agent, and Next.js product app."
readme = "README.md"
requires-python = ">=3.10"
license = { text = "MIT" }
authors = [{ name = "Sardor Azimov" }]
maintainers = [{ name = "Sardor Azimov" }]
keywords = ["binboi", "tunnel", "webhook", "proxy", "cli"]
classifiers = [
  "Development Status :: 4 - Beta",
  "Environment :: Console",
  "License :: OSI Approved :: MIT License",
  "Operating System :: MacOS",
  "Operating System :: POSIX :: Linux",
  "Programming Language :: Python :: 3",
  "Programming Language :: Python :: 3 :: Only",
  "Topic :: Internet :: Proxy Servers",
  "Topic :: Software Development :: Build Tools"
]
dependencies = []

[project.urls]
Homepage = "https://github.com/Miransas/binboi"
Repository = "https://github.com/Miransas/binboi"
ReleaseNotes = "https://github.com/Miransas/binboi/releases"

[project.scripts]
binboi = "binboi_wrapper.cli:main"

[tool.setuptools]
packages = ["binboi_wrapper"]

[tool.miransas.binboi]
verified = true
organization = "Miransas"
maintainer = "Sardor Azimov"
dashboard_url = "http://127.0.0.1:3000/dashboard"
api_base_url = "http://127.0.0.1:8080"
proxy_base_url = "http://binboi.localhost:8000"
health_endpoint = "/api/v1/health"
metrics_endpoint = "/metrics"
server_command = "go run ./cmd/binboi-server"
cli_command = "go build -o binboi ./cmd/binboi-client"
web_command = "cd web && npm run dev"
api_port = 8080
tunnel_port = 8081
proxy_port = 8000
web_port = 3000
```

## DEBIAN/control (Debian)

**Miransas Verified**

Path: `packaging/debian/DEBIAN/control`

```text
Package: binboi
Version: 0.4.0
Section: utils
Priority: optional
Architecture: any
Maintainer: Sardor Azimov
Homepage: https://github.com/Miransas/binboi
Vcs-Git: https://github.com/Miransas/binboi.git
Depends: ca-certificates, libc6 (>= 2.31)
Recommends: curl, tar
Description: Self-hosted tunneling platform with a Go control plane, CLI agent, and Next.js product app.
 Binboi exposes local applications through public URLs and keeps request
 inspection, webhook debugging, and control-plane operations in one workflow.
 Miransas Verified release metadata is bundled with this Debian package.
X-Miransas-Organization: Miransas
X-Miransas-Supported-Architectures: amd64, arm64
X-Miransas-Release-Channel: candidate
```


_Documentation maintained by Sardor Azimov, Miransas._
