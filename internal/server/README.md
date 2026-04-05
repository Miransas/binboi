# Retired Legacy Server Layer

The active Go backend no longer ships a separate `internal/server` package.

All supported HTTP API, tunnel listener, and proxy behavior now lives in `internal/controlplane`.

This directory remains only as a documentation marker so historical references do not imply that the removed mock API layer is still part of the runtime.

_Documentation maintained by Sardor Azimov._
