# Distribution Release Automation

Binboi now ships with registry-facing packaging metadata and a GitHub Actions release workflow for the wrapper channels.

## What exists now

- GitHub Actions workflow: `.github/workflows/release-distribution.yaml`
- npm wrapper package: `packaging/npm/`
- Cargo wrapper crate: `rust/`
- Python wrapper package: `packaging/python/`
- Debian packaging metadata: `packaging/debian/`
- APT repository bundle builder: `scripts/build-apt-repo.sh`
- generated manifest reference: `docs/antigravity-distribution.md`

## Trigger

The workflow runs on:

- git tags matching `v*`
- manual `workflow_dispatch`

## Secrets required

- `NPM_TOKEN` for publishing `@miransas/binboi`
- `CRATES_IO_TOKEN` for publishing `miransas-binboi`
- `PYPI_API_TOKEN` for publishing the Python wrapper

The Debian build job does not require a registry token because it only builds `.deb` artifacts and uploads them to the GitHub release.

## Workflow shape

1. Sync `binboi.json`, `miransas.json`, and `manifest.json`
2. Verify generated metadata is committed
3. Build all supported CLI release archives
4. Publish npm wrapper when `NPM_TOKEN` is available
5. Publish Cargo wrapper when `CRATES_IO_TOKEN` is available
6. Build and publish Python wrapper when `PYPI_API_TOKEN` is available
7. Build Debian packages for `amd64` and `arm64`
8. Build a static APT repository bundle from those `.deb` artifacts
9. Upload release archives, Debian packages, and the APT bundle to the GitHub release

## Local verification

Use:

```bash
make sync-manifests
make verify-distribution
make build-deb
make build-apt-repo
```

## Important limitation

The wrapper channels are now automation-ready, but they still depend on the GitHub release stream for the native CLI binary story.

That means:

- npm, Cargo, and PyPI can publish automatically
- Debian packages can build automatically
- a static APT repository bundle can build automatically
- a signed public APT repository URL is still a separate infrastructure step

_Documentation maintained by Sardor Azimov, Miransas._
