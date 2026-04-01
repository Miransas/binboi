# Binboi Server Entrypoint

This folder boots the Go control plane service.

Responsibilities:

- load runtime config
- start the tunnel listener
- start the public proxy
- register HTTP API routes

The heavy lifting lives in `internal/controlplane`.

_Documentation maintained by Sardor Azimov._
