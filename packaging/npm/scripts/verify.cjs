#!/usr/bin/env node
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
