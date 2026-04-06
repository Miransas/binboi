#!/usr/bin/env node
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
console.log("Release notes:", "https://github.com/Miransas/binboi/releases");
console.log("Recommended verification:");
for (const command of metadata.verifyCommands) {
  console.log("  -", command);
}
