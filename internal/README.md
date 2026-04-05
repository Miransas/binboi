# Go Internals

This folder contains the active Go implementation for the relay, control plane, CLI support, auth integration, and protocol layers.

Subfolders are organized by subsystem:

- `auth/`
- `cli/`
- `client/`
- `config/`
- `controlplane/`
- `protocol/`
- `proxy/`
- `utils/`

Legacy experimental packages such as `db/`, `models/`, and `server/` have been retired from the active build and are kept only as documentation markers so the current runtime path stays centered on `controlplane/`.

_Documentation maintained by Sardor Azimov._
