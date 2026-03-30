# Releasing the Binboi CLI

Binboi now exposes a release-friendly CLI build path that keeps `binboi version` stable for package managers and formula tests.

## Local build

```bash
make build-cli
./dist/binboi version
```

## Release artifacts

Use:

```bash
make release-cli VERSION=0.4.0
```

This produces `tar.gz` files in `dist/` using the expected naming pattern:

- `binboi_<version>_darwin_amd64.tar.gz`
- `binboi_<version>_darwin_arm64.tar.gz`
- `binboi_<version>_linux_amd64.tar.gz`
- `binboi_<version>_linux_arm64.tar.gz`

Each archive contains a single `binboi` binary at the archive root folder level:

```text
binboi_0.4.0_darwin_arm64/
  binboi
```

## Homebrew workflow

1. Run `make release-cli VERSION=<version>`.
2. Upload the generated archives to a GitHub release at `v<version>`.
3. Compute real SHA-256 values for each archive.
4. Replace the placeholders in `packaging/homebrew/binboi.rb`.
5. Test the formula with `binboi version`.

The formula intentionally keeps SHA placeholders instead of fake values.
