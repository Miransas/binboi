#!/usr/bin/env bash

# =============================================================================
# ElasiyaNetwork Installer / Setup Script
# =============================================================================
# Kullanım örnekleri:
#   ./scripts/install.sh                        → sadece derler
#   ./scripts/install.sh run --port 8080        → derler + server'ı --port 8080 ile çalıştırır
#   ./scripts/install.sh install --port 8080    → derler + /usr/local/bin'e kurar + systemd servisi oluşturur

set -euo pipefail

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_NAME="elasiyanetwork"
SERVER_BINARY="elasiya-server"
BINARY_OUTPUT_DIR="./bin"
INSTALL_PATH="/usr/local/bin/${SERVER_BINARY}"
SERVICE_FILE="/etc/systemd/system/${PROJECT_NAME}.service"

# Minimum Go sürümü
MIN_GO_VERSION="1.21"

# Varsayılan port (değiştirilebilir)
PORT=""

# Komut satırı argümanlarını parse et
while [[ $# -gt 0 ]]; do
    case $1 in
        --port)
            PORT="$2"
            shift 2
            ;;
        run|install|build)
            MODE="$1"
            shift
            ;;
        *)
            echo -e "${RED}Bilinmeyen argüman: $1${NC}"
            echo "Kullanım: $0 [build|run|install] [--port 8080]"
            exit 1
            ;;
    esac
done

# Mode yoksa varsayılan: build
MODE="${MODE:-build}"

echo -e "${GREEN}======================================"
echo -e "   ElasiyaNetwork Setup Script"
echo -e "======================================${NC}"

# 1. Go sürümünü kontrol et
check_go_version() {
    if ! command -v go &> /dev/null; then
        echo -e "${RED}Hata: Go yüklü değil! https://go.dev/dl/ adresinden Go 1.21+ yükleyin.${NC}"
        exit 1
    fi

    GO_VERSION=$(go version | grep -oP 'go1\.\d+\.\d+')
    if [[ ! "${GO_VERSION}" > "${MIN_GO_VERSION}" ]]; then
        echo -e "${RED}Hata: Go sürümünüz ${GO_VERSION}. Minimum ${MIN_GO_VERSION} gerekiyor.${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Go sürümü uygun: ${GO_VERSION}${NC}"
}

# 2. Bağımlılıkları indir
fetch_deps() {
    echo -e "${YELLOW}Bağımlılıklar indiriliyor...${NC}"
    go mod tidy
    go mod download
    echo -e "${GREEN}✓ Bağımlılıklar tamamlandı${NC}"
}

# 3. Binary derle
build() {
    mkdir -p "${BINARY_OUTPUT_DIR}"

    echo -e "${YELLOW}Server derleniyor → ${BINARY_OUTPUT_DIR}/${SERVER_BINARY}${NC}"
    go build -o "${BINARY_OUTPUT_DIR}/${SERVER_BINARY}" ./cmd/elasiya-server

    echo -e "${GREEN}✓ Derleme tamamlandı!${NC}"
    ls -lh "${BINARY_OUTPUT_DIR}"
}

# 4. Server'ı doğrudan çalıştır
run_server() {
    if [ ! -f "${BINARY_OUTPUT_DIR}/${SERVER_BINARY}" ]; then
        build
    fi

    CMD=("${BINARY_OUTPUT_DIR}/${SERVER_BINARY}")
    if [ -n "$PORT" ]; then
        CMD+=("--port" "$PORT")
        echo -e "${YELLOW}Server --port $PORT ile başlatılıyor...${NC}"
    else
        echo -e "${YELLOW}Server başlatılıyor... (varsayılan port)${NC}"
    fi

    "${CMD[@]}"
}

# 5. Sistem geneline kur + systemd servisi oluştur
install_system() {
    build

    if [ ! -f "${BINARY_OUTPUT_DIR}/${SERVER_BINARY}" ]; then
        echo -e "${RED}Binary bulunamadı.${NC}"
        exit 1
    fi

    echo -e "${YELLOW}Binary'yi sistem geneline kopyalanıyor (${INSTALL_PATH})${NC}"
    sudo cp "${BINARY_OUTPUT_DIR}/${SERVER_BINARY}" "${INSTALL_PATH}"
    sudo chmod +x "${INSTALL_PATH}"

    # Systemd servisi oluştur
    echo -e "${YELLOW}Systemd servisi oluşturuluyor...${NC}"
    sudo bash -c "cat > ${SERVICE_FILE}" << EOF
[Unit]
Description=ElasiyaNetwork Server
After=network.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=${INSTALL_PATH} ${PORT:+--port $PORT}
Restart=always
RestartSec=5
User=$(whoami)
WorkingDirectory=$(pwd)
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable --now ${PROJECT_NAME}

    echo -e "${GREEN}✓ Kurulum ve servis tamamlandı!${NC}"
    echo "Durum kontrolü:   sudo systemctl status ${PROJECT_NAME}"
    echo "Logları izle:     journalctl -u ${PROJECT_NAME} -f"
    echo "Durdur:           sudo systemctl stop ${PROJECT_NAME}"
}

# =============================================================================
# Ana işlem
# =============================================================================

check_go_version
fetch_deps

case "$MODE" in
    build)
        build
        echo -e "\n${GREEN}Derleme tamamlandı!${NC}"
        echo "Çalıştırmak için:"
        echo "  ./${BINARY_OUTPUT_DIR}/${SERVER_BINARY} [--port 8080]"
        ;;
    run)
        run_server
        ;;
    install)
        install_system
        ;;
    *)
        echo -e "${YELLOW}Kullanım:${NC}"
        echo "  ./scripts/install.sh build                  → sadece derle"
        echo "  ./scripts/install.sh run [--port 8080]      → derle + server'ı çalıştır"
        echo "  ./scripts/install.sh install [--port 8080]  → derle + sistem geneline kur + servis oluştur"
        exit 1
        ;;
esac

echo -e "\n${GREEN}İşlem bitti!${NC}"


# install_system() fonksiyonu içine ekle (systemd servisi kısmında)

sudo bash -c "cat > ${SERVICE_FILE}" << EOF
[Unit]
Description=ElasiyaNetwork Server
After=network.target
Wants=network-online.target

[Service]
Type=simple
# Config dosyası varsa onu kullan
Environment="CONFIG_PATH=/etc/elasiyanetwork/config.yaml"
ExecStart=${INSTALL_PATH} --config \${CONFIG_PATH} ${PORT:+--port $PORT}
Restart=always
RestartSec=5
User=$(whoami)
WorkingDirectory=$(pwd)
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF