# Install Binboi via curl

The quickest way to install the Binboi CLI on macOS or Linux. The install script
detects your OS and architecture, downloads the matching release archive from
GitHub, and places the `binboi` binary in `/usr/local/bin`.

## Prerequisites

- macOS (Intel or Apple Silicon) or Linux (amd64 or arm64)
- `curl`, `tar` — available by default on all supported platforms
- Write access to `/usr/local/bin` (the script will prompt for `sudo` if needed)

## Install

```bash
curl -fsSL https://raw.githubusercontent.com/Miransas/binboi/main/install.sh | bash
```

The script will:

1. Detect your OS and CPU architecture
2. Resolve the latest release version from GitHub
3. Download `binboi_<version>_<os>_<arch>.tar.gz`
4. Extract the binary and move it to `/usr/local/bin/binboi`

### Install a specific version

```bash
curl -fsSL https://raw.githubusercontent.com/Miransas/binboi/main/install.sh | bash -s -- --version 0.4.0
```

### Install to a custom directory

```bash
curl -fsSL https://raw.githubusercontent.com/Miransas/binboi/main/install.sh | INSTALL_DIR=$HOME/.local/bin bash
```

## Verify installation

```bash
binboi version
```

Expected output:

```
0.4.0
```

## First tunnel

**1. Log in with your access token**

Create a token at <https://binboi.com/dashboard/access-tokens>, then:

```bash
binboi login --token <your-token>
```

Output:

```
Authenticated as Sardor Azimov <sardor@example.com>
Plan: FREE
Token: bb_... (flag)
Server: binboi.com:8081
Saved to /home/you/.binboi/config.json
```

**2. Expose a local port**

```bash
# Expose localhost:3000 with a random subdomain
binboi http 3000

# Expose localhost:8080 with a custom subdomain
binboi http 8080 myapp
```

Your app is now live at `https://myapp.binboi.com`.

## Troubleshooting

**`command not found: binboi` after install**

`/usr/local/bin` may not be on your `PATH`. Add it:

```bash
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
```

Or if `INSTALL_DIR` was set to a custom path, add that directory instead.

**`Permission denied` during install**

The script needs write access to `/usr/local/bin`. Run with `sudo`:

```bash
curl -fsSL https://raw.githubusercontent.com/Miransas/binboi/main/install.sh | sudo bash
```

**SSL/TLS errors on old systems**

Ensure `ca-certificates` is up to date:

```bash
# Debian/Ubuntu
sudo apt-get install --reinstall ca-certificates

# RHEL/Fedora
sudo dnf reinstall ca-certificates
```

**Manually download a specific archive**

All release archives are at:
<https://github.com/Miransas/binboi/releases>

```bash
VERSION=0.4.0
OS=linux       # darwin or linux
ARCH=amd64     # amd64 or arm64

curl -fsSL "https://github.com/Miransas/binboi/releases/download/v${VERSION}/binboi_${VERSION}_${OS}_${ARCH}.tar.gz" \
  | tar -xz -C /usr/local/bin binboi_${VERSION}_${OS}_${ARCH}/binboi --strip-components=1
```
