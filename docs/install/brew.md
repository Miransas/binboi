# Install Binboi via Homebrew

The recommended install path on macOS. Homebrew manages upgrades and puts
`binboi` on your `PATH` automatically.

## Prerequisites

- macOS (Apple Silicon or Intel)
- [Homebrew](https://brew.sh) installed

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/homebrew/install/HEAD/install.sh)"
```

## Install

```bash
brew tap binboi/tap
brew install binboi
```

Or in a single command:

```bash
brew install binboi/tap/binboi
```

## Verify installation

```bash
binboi version
```

Expected output:

```
0.4.0
```

## Upgrade

```bash
brew upgrade binboi
```

## Uninstall

```bash
brew uninstall binboi
brew untap binboi/tap   # optional — removes the tap entirely
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
Saved to /Users/you/.binboi/config.json
```

**2. Expose a local port**

```bash
# Expose localhost:3000 with a random subdomain
binboi http 3000

# Expose localhost:5173 with a custom subdomain
binboi http 5173 myapp
```

Your app is live at `https://myapp.binboi.com`.

## Troubleshooting

**`Error: No formulae found in taps`**

The tap may not be initialised yet. Run:

```bash
brew tap binboi/tap
brew install binboi
```

**`brew upgrade binboi` does nothing**

You are already on the latest version. Check with:

```bash
binboi version
brew info binboi
```

**`binboi: command not found` after install**

Homebrew's prefix may not be on your `PATH`. For Apple Silicon Macs:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

For Intel Macs:

```bash
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/usr/local/bin/brew shellenv)"
```

**Verify the formula locally**

```bash
brew test binboi
```

This runs `binboi version` against the installed binary, which is the same
check the formula's `test do` block uses.
