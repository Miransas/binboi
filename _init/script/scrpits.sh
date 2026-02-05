#!/usr/bin/env bash

# =============================================================================
# ElasiyaNetwork Installer / Setup Script
# =============================================================================
# Bu script projeyi klonladıktan sonra derlemeye ve çalıştırmaya hazır hale getirir.
# Kullanım:
#   ./scripts/install.sh          → sadece derler
#   ./scripts/install.sh run      → derler + server'ı çalıştırır
#   ./scripts/install.sh install  → derler + binary'yi /usr/local/bin'e kopyalar (sudo ister)

set -euo pipefail

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_NAME="elasiyanetwork"
SERVER_BINARY="elasiya-server"
BINARY_OUTPUT_DIR="./bin"
INSTALL_PATH="/usr/local/bin/${SERVER_BINARY}"

# Minimum Go sürümü
MIN_GO_VERSION="1.21"

echo -e "${GREEN}======================================"
echo -e "   ElasiyaNetwork Setup Script"
echo -e "======================================${NC}"

# 1. Go sürümünü kontrol et
check_go_version() {
    if ! command -v go &> /dev/null; then
        echo -e "${RED}Hata: Go yüklü değil! Lütfen https://go.dev/dl/ adresinden Go 1.21+ yükleyin.${NC}"
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

# 3. Binary'leri derle
build() {
    mkdir -p "${BINARY_OUTPUT_DIR}"

    echo -e "${YELLOW}Server derleniyor → ${BINARY_OUTPUT_DIR}/${SERVER_BINARY}${NC}"
    go build -o "${BINARY_OUTPUT_DIR}/${SERVER_BINARY}" ./cmd/elasiya-server

    # Eğer client da derlenecekse (client/ içinde main.go varsa ekle)
    # if [ -d "./client" ] && [ -f "./client/main.go" ]; then
    #     echo -e "${YELLOW}Client derleniyor...${NC}"
    #     go build -o "${BINARY_OUTPUT_DIR}/elasiya-client" ./client
    # fi

    echo -e "${GREEN}✓ Derleme tamamlandı! Binary'ler: ${BINARY_OUTPUT_DIR}/${NC}"
    ls -lh "${BINARY_OUTPUT_DIR}"
}

# 4. Çalıştırma modu
run_server() {
    if [ ! -f "${BINARY_OUTPUT_DIR}/${SERVER_BINARY}" ]; then
        build
    fi

    echo -e "${YELLOW}Server başlatılıyor... (Ctrl+C ile durdurabilirsiniz)${NC}"
    "${BINARY_OUTPUT_DIR}/${SERVER_BINARY}"
}

# 5. Sistem geneline kur (sudo ister)
install_system() {
    build

    if [ ! -f "${BINARY_OUTPUT_DIR}/${SERVER_BINARY}" ]; then
        echo -e "${RED}Derleme başarısız, binary bulunamadı.${NC}"
        exit 1
    fi

    echo -e "${YELLOW}Binary'yi sistem geneline kurmak için sudo gerekiyor (${INSTALL_PATH})${NC}"
    sudo cp "${BINARY_OUTPUT_DIR}/${SERVER_BINARY}" "${INSTALL_PATH}"
    sudo chmod +x "${INSTALL_PATH}"

    echo -e "${GREEN}✓ Kurulum tamamlandı! Artık şu komutla çalıştırabilirsiniz:${NC}"
    echo "    ${SERVER_BINARY} --help"
    echo "    ${SERVER_BINARY}"
}

# =============================================================================
# Ana mantık
# =============================================================================

check_go_version
fetch_deps

case "${1:-build}" in
    build)
        build
        echo -e "\n${GREEN}Kurulum tamam! Çalıştırmak için:${NC}"
        echo "  cd ${PWD}"
        echo "  ./${BINARY_OUTPUT_DIR}/${SERVER_BINARY}"
        ;;
    run)
        run_server
        ;;
    install)
        install_system
        ;;
    *)
        echo -e "${YELLOW}Kullanım:${NC}"
        echo "  ./scripts/install.sh               → derle"
        echo "  ./scripts/install.sh run           → derle + server'ı çalıştır"
        echo "  ./scripts/install.sh install       → derle + /usr/local/bin'e kur (sudo)"
        exit 1
        ;;
esac

echo -e "\n${GREEN}İşlem tamamlandı! Sorun olursa README'yi kontrol et veya issue aç.${NC}"