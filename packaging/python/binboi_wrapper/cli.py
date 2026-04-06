from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

VERSION = "0.4.0"
RELEASE_NOTES = "https://github.com/Miransas/binboi/releases"
REPOSITORY = "https://github.com/Miransas/binboi"
METADATA = {
  "organization": "Miransas",
  "maintainer": "Sardor Azimov",
  "repository": "https://github.com/Miransas/binboi",
  "version": "0.4.0",
  "releaseChannel": "candidate",
  "apiVersion": "v1",
  "minimumCliVersion": "0.4.0",
  "runtimeCommands": {
    "server": "go run ./cmd/binboi-server",
    "cli": "go build -o binboi ./cmd/binboi-client",
    "web": "cd web && npm run dev"
  },
  "defaultPorts": {
    "api": 8080,
    "tunnel": 8081,
    "proxy": 8000,
    "web": 3000
  },
  "endpoints": {
    "dashboardUrl": "http://127.0.0.1:3000/dashboard",
    "publicDashboardUrl": "http://127.0.0.1:3000/dashboard",
    "apiBaseUrl": "http://127.0.0.1:8080",
    "proxyBaseUrl": "http://binboi.localhost:8000",
    "health": "/api/v1/health",
    "metrics": "/metrics"
  },
  "verifyCommands": [
    "binboi version",
    "binboi whoami"
  ]
}


def config_dir() -> Path:
    if sys.platform == "win32":
        return Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming")) / "binboi"
    return Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config")) / "binboi"


def persist_defaults() -> Path:
    directory = config_dir()
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "distribution-defaults.json").write_text(json.dumps(METADATA, indent=2) + "\n", encoding="utf-8")
    return directory


def delegate(args: list[str]) -> int | None:
    native = os.environ.get("BINBOI_NATIVE_BIN")
    if not native:
        return None
    return subprocess.call([native, *args])


def main() -> int:
    args = sys.argv[1:]

    if args[:1] == ["version"] or "--version" in args:
        print(VERSION)
        return 0

    if args[:1] == ["verify-install"] or args[:1] == ["--post-install"]:
        directory = persist_defaults()
        print("[Miransas Verified] Binboi Python wrapper configured.")
        print(f"Stored defaults: {directory}")
        print("Verification:")
        print("  - binboi version")
        print("  - binboi whoami")
        return 0

    delegated = delegate(args)
    if delegated is not None:
        return delegated

    persist_defaults()
    print("[Miransas Verified] Binboi Python wrapper is ready.")
    print("No native release binary is bundled in this package yet.")
    print(f"Repository: {REPOSITORY}")
    print(f"Release notes: {RELEASE_NOTES}")
    print("Run: binboi version")
    print("Then: binboi whoami")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
