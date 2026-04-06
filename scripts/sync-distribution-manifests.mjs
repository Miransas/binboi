#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), "utf8"));
}

function writeFile(relativePath, content) {
  const targetPath = path.join(rootDir, relativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content.endsWith("\n") ? content : `${content}\n`);
}

function writeExecutableFile(relativePath, content) {
  writeFile(relativePath, content);
  fs.chmodSync(path.join(rootDir, relativePath), 0o755);
}

function writeJson(relativePath, value) {
  writeFile(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

const identity = readJson("binboi.json");
const blueprint = readJson("miransas.json");

const version = identity.version;
const description = identity.description;
const repository = identity.repository;
const license = identity.license;
const maintainer = identity.maintainer;
const organization = identity.owner;
const releaseNotesUrl = identity.docs.releaseNotesUrl;
const nodeRequirement = blueprint.versions?.nodeRequirement ?? "20+";
const runtimeCommands = blueprint.runtime?.commands ?? {};
const defaultPorts = blueprint.runtime?.defaultPorts ?? identity.defaultPorts ?? {};
const endpoints = identity.endpoints ?? blueprint.endpoints ?? {};
const releaseChannel = identity.releaseChannel;
const apiVersion = identity.apiVersion;
const minimumCliVersion = identity.minimumCliVersion;
const buildPlatforms = identity.buildTarget?.platforms ?? [];
const linuxArchitectures = [...new Set(buildPlatforms
  .filter((platform) => platform.startsWith("linux/"))
  .map((platform) => platform.split("/")[1]))];

const verifyCommands = [
  "binboi version",
  "binboi whoami",
];

const sharedMetadata = {
  organization,
  maintainer,
  repository,
  version,
  releaseChannel,
  apiVersion,
  minimumCliVersion,
  runtimeCommands,
  defaultPorts,
  endpoints,
  verifyCommands,
};

const sharedMetadataJson = JSON.stringify(sharedMetadata, null, 2);

writeJson("manifest.json", blueprint);

const npmPackage = {
  name: "@miransas/binboi",
  version,
  description,
  license,
  author: maintainer,
  repository: {
    type: "git",
    url: `git+${repository}.git`,
  },
  homepage: `${repository}#readme`,
  bugs: {
    url: `${repository}/issues`,
  },
  publishConfig: {
    access: "public",
  },
  engines: {
    node: ">=20",
  },
  os: ["darwin", "linux"],
  cpu: ["x64", "arm64"],
  bin: {
    binboi: "./bin/binboi.cjs",
  },
  files: [
    "README.md",
    "bin",
    "scripts",
  ],
  scripts: {
    postinstall: "node ./scripts/postinstall.cjs",
    "verify-install": "node ./scripts/verify.cjs",
  },
  keywords: [
    "binboi",
    "tunnel",
    "webhook",
    "proxy",
    "cli",
    "miransas",
  ],
  miransas: {
    verified: true,
    organization,
    maintainer,
    nodeRequirement,
    runtime: {
      commands: runtimeCommands,
      defaultPorts,
    },
    endpoints,
  },
};

writeJson("packaging/npm/package.json", npmPackage);

writeFile(
  "packaging/npm/README.md",
  `# @miransas/binboi

Miransas Verified

This package is the Binboi CLI wrapper for the NPM and Bun ecosystem.

- Version: ${version}
- Repository: ${repository}
- Maintainer: ${maintainer}
- Organization: ${organization}

Runtime defaults:

- API port: ${defaultPorts.api}
- Tunnel port: ${defaultPorts.tunnel}
- Proxy port: ${defaultPorts.proxy}
- Web port: ${defaultPorts.web}

Verification:

\`\`\`bash
${verifyCommands.join("\n")}
\`\`\`
`,
);

writeFile(
  "packaging/npm/scripts/metadata.cjs",
  `module.exports = ${sharedMetadataJson};
`,
);

writeExecutableFile(
  "packaging/npm/scripts/verify.cjs",
  `#!/usr/bin/env node
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const metadata = require("./metadata.cjs");

function configDir() {
  if (process.platform === "win32") {
    return path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "binboi");
  }

  return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "binboi");
}

function persistDefaults() {
  const directory = configDir();
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "distribution-defaults.json"), JSON.stringify(metadata, null, 2));
  return directory;
}

function run() {
  const directory = persistDefaults();
  console.log("[Miransas Verified] Binboi NPM wrapper configured.");
  console.log("Stored defaults:", directory);
  console.log("Dashboard:", metadata.endpoints.dashboardUrl);
  console.log("API base:", metadata.endpoints.apiBaseUrl);
  console.log("Proxy base:", metadata.endpoints.proxyBaseUrl);
  console.log("Verification:");
  for (const command of metadata.verifyCommands) {
    console.log("  -", command);
  }
}

if (require.main === module) {
  run();
}

module.exports = { run };
`,
);

writeExecutableFile(
  "packaging/npm/scripts/postinstall.cjs",
  `#!/usr/bin/env node
const { run } = require("./verify.cjs");

run();
`,
);

writeExecutableFile(
  "packaging/npm/bin/binboi.cjs",
  `#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const metadata = require("../scripts/metadata.cjs");
const { run } = require("../scripts/verify.cjs");

const args = process.argv.slice(2);
const nativeBinary = process.env.BINBOI_NATIVE_BIN || path.join(__dirname, "..", "native", process.platform === "win32" ? "binboi.exe" : "binboi");

if (args[0] === "version" || args.includes("--version")) {
  console.log(metadata.version);
  process.exit(0);
}

if (args[0] === "verify-install") {
  run();
  process.exit(0);
}

if (fs.existsSync(nativeBinary)) {
  const result = spawnSync(nativeBinary, args, { stdio: "inherit" });
  process.exit(result.status ?? 0);
}

console.log("[Miransas Verified] Binboi NPM wrapper is ready.");
console.log("A native release binary is not bundled in this package yet.");
console.log("Repository:", metadata.repository);
console.log("Release notes:", "${releaseNotesUrl}");
console.log("Recommended verification:");
for (const command of metadata.verifyCommands) {
  console.log("  -", command);
}
`,
);

const cargoToml = `[package]
name = "miransas-binboi"
version = "${version}"
edition = "2021"
license = "${license}"
description = "${description}"
readme = "README.md"
repository = "${repository}"
homepage = "${repository}"
authors = ["${maintainer}"]
keywords = ["binboi", "tunnel", "webhook", "proxy", "cli"]
categories = ["command-line-utilities", "development-tools"]
build = "build.rs"

[package.metadata.miransas]
verified = true
organization = "${organization}"
maintainer = "${maintainer}"
release_notes = "${releaseNotesUrl}"
dashboard_url = "${endpoints.dashboardUrl}"
api_base_url = "${endpoints.apiBaseUrl}"
proxy_base_url = "${endpoints.proxyBaseUrl}"
health_endpoint = "${endpoints.health}"
metrics_endpoint = "${endpoints.metrics}"
server_command = "${runtimeCommands.server}"
cli_command = "${runtimeCommands.cli}"
web_command = "${runtimeCommands.web}"
api_port = ${defaultPorts.api}
tunnel_port = ${defaultPorts.tunnel}
proxy_port = ${defaultPorts.proxy}
web_port = ${defaultPorts.web}
supported_platforms = [${buildPlatforms.map((platform) => `"${platform}"`).join(", ")}]

[[bin]]
name = "binboi"
path = "src/main.rs"
`;

writeFile("rust/Cargo.toml", cargoToml);

writeFile(
  "rust/README.md",
  `# miransas-binboi

Miransas Verified

This crate is a metadata-heavy wrapper for the Binboi release channel.

- Version: ${version}
- Repository: ${repository}
- Maintainer: ${maintainer}
- Release notes: ${releaseNotesUrl}

Verification:

\`\`\`bash
${verifyCommands.join("\n")}
\`\`\`
`,
);

writeFile(
  "rust/build.rs",
  `fn main() {
    println!("cargo:warning=[Miransas Verified] Binboi wrapper crate configured for ${repository}");
    println!("cargo:warning=Verification: ${verifyCommands.join(" && ")}");
    println!("cargo:warning=Dashboard: ${endpoints.dashboardUrl}");
    println!("cargo:warning=API base: ${endpoints.apiBaseUrl}");
  }
`,
);

writeFile(
  "rust/src/main.rs",
  `use std::env;
use std::fs;
use std::path::PathBuf;
use std::process::{exit, Command};

const VERSION: &str = "${version}";
const RELEASE_NOTES: &str = "${releaseNotesUrl}";
const REPOSITORY: &str = "${repository}";

fn config_dir() -> PathBuf {
    if cfg!(target_os = "windows") {
        if let Ok(appdata) = env::var("APPDATA") {
            return PathBuf::from(appdata).join("binboi");
        }
    }

    if let Ok(xdg) = env::var("XDG_CONFIG_HOME") {
        return PathBuf::from(xdg).join("binboi");
    }

    let home = env::var("HOME").unwrap_or_else(|_| ".".to_string());
    PathBuf::from(home).join(".config").join("binboi")
}

fn persist_defaults() -> Result<PathBuf, std::io::Error> {
    let directory = config_dir();
    fs::create_dir_all(&directory)?;
    let content = r###"${sharedMetadataJson}"###;
    fs::write(directory.join("distribution-defaults.json"), content)?;
    Ok(directory)
}

fn try_delegate(args: &[String]) -> Option<i32> {
    let native = env::var("BINBOI_NATIVE_BIN").ok()?;
    let status = Command::new(native).args(args).status().ok()?;
    Some(status.code().unwrap_or(0))
}

fn main() {
    let args: Vec<String> = env::args().skip(1).collect();

    if args.first().map(|value| value == "version").unwrap_or(false) || args.iter().any(|value| value == "--version") {
        println!("{}", VERSION);
        return;
    }

    if args.first().map(|value| value == "verify-install").unwrap_or(false) {
        match persist_defaults() {
            Ok(directory) => {
                println!("[Miransas Verified] Binboi Cargo wrapper configured.");
                println!("Stored defaults: {}", directory.display());
                println!("Verification:");
                println!("  - binboi version");
                println!("  - binboi whoami");
            }
            Err(error) => {
                eprintln!("failed to persist defaults: {}", error);
                exit(1);
            }
        }
        return;
    }

    if let Some(code) = try_delegate(&args) {
        exit(code);
    }

    let _ = persist_defaults();
    println!("[Miransas Verified] Binboi Cargo wrapper is ready.");
    println!("No native release binary is bundled in this crate yet.");
    println!("Repository: {}", REPOSITORY);
    println!("Release notes: {}", RELEASE_NOTES);
    println!("Run: binboi version");
    println!("Then: binboi whoami");
}
`,
);

const pyprojectToml = `[build-system]
requires = ["setuptools>=69", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "binboi"
version = "${version}"
description = "${description}"
readme = "README.md"
requires-python = ">=3.10"
license = { text = "${license}" }
authors = [{ name = "${maintainer}" }]
maintainers = [{ name = "${maintainer}" }]
keywords = ["binboi", "tunnel", "webhook", "proxy", "cli"]
classifiers = [
  "Development Status :: 4 - Beta",
  "Environment :: Console",
  "License :: OSI Approved :: MIT License",
  "Operating System :: MacOS",
  "Operating System :: POSIX :: Linux",
  "Programming Language :: Python :: 3",
  "Programming Language :: Python :: 3 :: Only",
  "Topic :: Internet :: Proxy Servers",
  "Topic :: Software Development :: Build Tools"
]
dependencies = []

[project.urls]
Homepage = "${repository}"
Repository = "${repository}"
ReleaseNotes = "${releaseNotesUrl}"

[project.scripts]
binboi = "binboi_wrapper.cli:main"

[tool.setuptools]
packages = ["binboi_wrapper"]

[tool.miransas.binboi]
verified = true
organization = "${organization}"
maintainer = "${maintainer}"
dashboard_url = "${endpoints.dashboardUrl}"
api_base_url = "${endpoints.apiBaseUrl}"
proxy_base_url = "${endpoints.proxyBaseUrl}"
health_endpoint = "${endpoints.health}"
metrics_endpoint = "${endpoints.metrics}"
server_command = "${runtimeCommands.server}"
cli_command = "${runtimeCommands.cli}"
web_command = "${runtimeCommands.web}"
api_port = ${defaultPorts.api}
tunnel_port = ${defaultPorts.tunnel}
proxy_port = ${defaultPorts.proxy}
web_port = ${defaultPorts.web}
`;

writeFile("packaging/python/pyproject.toml", pyprojectToml);

writeFile(
  "packaging/python/README.md",
  `# binboi

Miransas Verified

This package is the Python wrapper distribution for the Binboi CLI.

${description}

Verification:

\`\`\`bash
${verifyCommands.join("\n")}
\`\`\`
`,
);

writeFile(
  "packaging/python/setup.py",
  `import json
import os
from pathlib import Path
from setuptools import setup
from setuptools.command.install import install

ROOT = Path(__file__).parent
README = (ROOT / "README.md").read_text(encoding="utf-8")
METADATA = ${sharedMetadataJson}


def config_dir() -> Path:
    if os.name == "nt":
        return Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming")) / "binboi"
    return Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config")) / "binboi"


class VerifiedInstall(install):
    def run(self):
        super().run()
        directory = config_dir()
        directory.mkdir(parents=True, exist_ok=True)
        (directory / "distribution-defaults.json").write_text(json.dumps(METADATA, indent=2) + "\\n", encoding="utf-8")
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
`,
);

writeFile(
  "packaging/python/binboi_wrapper/__init__.py",
  `__all__ = ["main"]

from .cli import main
`,
);

writeFile(
  "packaging/python/binboi_wrapper/cli.py",
  `from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

VERSION = "${version}"
RELEASE_NOTES = "${releaseNotesUrl}"
REPOSITORY = "${repository}"
METADATA = ${sharedMetadataJson}


def config_dir() -> Path:
    if sys.platform == "win32":
        return Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming")) / "binboi"
    return Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config")) / "binboi"


def persist_defaults() -> Path:
    directory = config_dir()
    directory.mkdir(parents=True, exist_ok=True)
    (directory / "distribution-defaults.json").write_text(json.dumps(METADATA, indent=2) + "\\n", encoding="utf-8")
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
`,
);

const debControl = `Package: binboi
Version: ${version}
Section: utils
Priority: optional
Architecture: any
Maintainer: ${maintainer}
Homepage: ${repository}
Vcs-Git: ${repository}.git
Depends: ca-certificates, libc6 (>= 2.31)
Recommends: curl, tar
Description: ${description}
 Binboi exposes local applications through public URLs and keeps request
 inspection, webhook debugging, and control-plane operations in one workflow.
 Miransas Verified release metadata is bundled with this Debian package.
X-Miransas-Organization: ${organization}
X-Miransas-Supported-Architectures: ${linuxArchitectures.join(", ")}
X-Miransas-Release-Channel: ${releaseChannel}
`;

writeFile("packaging/debian/DEBIAN/control", debControl);

writeExecutableFile(
  "packaging/debian/DEBIAN/postinst",
  `#!/usr/bin/env bash
set -euo pipefail

CONFIG_DIR="/etc/binboi"
mkdir -p "$CONFIG_DIR"

cat > "$CONFIG_DIR/distribution-defaults.json" <<'EOF'
${sharedMetadataJson}
EOF

echo "[Miransas Verified] Binboi Debian package configured."
echo "Stored defaults: $CONFIG_DIR/distribution-defaults.json"

if command -v binboi >/dev/null 2>&1; then
  binboi version || true
fi

echo "Verification:"
echo "  - binboi version"
echo "  - binboi whoami"
`,
);

const configBlocks = [
  { title: "package.json (NPM)", path: "packaging/npm/package.json", body: JSON.stringify(npmPackage, null, 2) },
  { title: "Cargo.toml (Rust)", path: "rust/Cargo.toml", body: cargoToml.trimEnd() },
  { title: "pyproject.toml (Python)", path: "packaging/python/pyproject.toml", body: pyprojectToml.trimEnd() },
  { title: "DEBIAN/control (Debian)", path: "packaging/debian/DEBIAN/control", body: debControl.trimEnd() },
];

const markdownSections = configBlocks
  .map(
    (block) => `## ${block.title}

**Miransas Verified**

Path: \`${block.path}\`

\`\`\`${block.path.endsWith(".json") ? "json" : block.path.endsWith(".toml") ? "toml" : "text"}
${block.body}
\`\`\`
`,
  )
  .join("\n");

writeFile(
  "docs/antigravity-distribution.md",
  `# Antigravity Distribution Protocol

This document is generated from \`binboi.json\` and \`manifest.json\` for the Binboi release channel.

- Version: ${version}
- Maintainer: ${maintainer}
- Organization: ${organization}
- Repository: ${repository}

Runtime defaults:

- API port: ${defaultPorts.api}
- Tunnel port: ${defaultPorts.tunnel}
- Proxy port: ${defaultPorts.proxy}
- Web port: ${defaultPorts.web}

Verification:

\`\`\`bash
${verifyCommands.join("\n")}
\`\`\`

${markdownSections}

_Documentation maintained by ${maintainer}._
`,
);

console.log("Synced distribution manifests:");
console.log("  - manifest.json");
console.log("  - packaging/npm/package.json");
console.log("  - rust/Cargo.toml");
console.log("  - packaging/python/pyproject.toml");
console.log("  - packaging/debian/DEBIAN/control");
console.log("  - docs/antigravity-distribution.md");
