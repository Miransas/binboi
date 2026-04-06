import json
import os
from pathlib import Path
from setuptools import setup
from setuptools.command.install import install

ROOT = Path(__file__).parent
README = (ROOT / "README.md").read_text(encoding="utf-8")
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
    if os.name == "nt":
        return Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming")) / "binboi"
    return Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config")) / "binboi"


class VerifiedInstall(install):
    def run(self):
        super().run()
        directory = config_dir()
        directory.mkdir(parents=True, exist_ok=True)
        (directory / "distribution-defaults.json").write_text(json.dumps(METADATA, indent=2) + "\n", encoding="utf-8")
        print("[Miransas Verified] Binboi Python package configured.")
        print(f"Stored defaults: {directory}")
        print("Verification:")
        print("  - binboi version")
        print("  - binboi whoami")

setup(
    long_description=README,
    long_description_content_type="text/markdown",
    cmdclass={"install": VerifiedInstall},
)
