# Scripts

This folder is the home for repo automation helpers and developer utility scripts.

Current scripts:

- `sync-project-manifests.sh`: regenerate `miransas.json` and `binboi.json` from the current repo versions
- `sync-distribution-manifests.mjs`: regenerate the packaging manifests for npm, Cargo, PyPI, and Debian
- `verify-distribution-manifests.sh`: validate the generated packaging manifests locally
- `build-debian-package.sh`: build a Debian package from the current CLI source
- `build-apt-repo.sh`: build a static APT repository bundle from generated `.deb` files

Use `make sync-manifests` to refresh the checked-in project metadata files after version changes.

_Documentation maintained by Sardor Azimov, Miransas._
