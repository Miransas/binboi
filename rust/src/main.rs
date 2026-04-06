use std::env;
use std::fs;
use std::path::PathBuf;
use std::process::{exit, Command};

const VERSION: &str = "0.4.0";
const RELEASE_NOTES: &str = "https://github.com/Miransas/binboi/releases";
const REPOSITORY: &str = "https://github.com/Miransas/binboi";

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
    let content = r###"{
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
}"###;
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
