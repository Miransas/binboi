module.exports = {
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
};
