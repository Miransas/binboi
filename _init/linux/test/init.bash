# Projeyi klonla
git clone https://github.com/sardorazimov/elasiyanetwork.git
cd elasiyanetwork

# Bağımlılıkları indir
go mod download

# Binary'i derle
# (eğer cmd/elasiya-server gibi bir ana paket varsa – repo yapısına göre uyarla)
go build -o elasiyanetwork ./cmd/...   # veya tam yol: ./cmd/elasiya-server/main.go

# Binary şimdi aynı klasörde oluşur: ./elasiyanetwork
# Test et:
./elasiyanetwork
# veya
./elasiyanetwork --help   (eğer flag destekliyorsa)

#Binary'i global bir yere taşı (production için önerilir):bash

sudo mv elasiyanetwork /usr/local/bin/elasiyanetwork
sudo chmod +x /usr/local/bin/elasiyanetwork

#Linux'ta (systemd kullanan sistemler: Ubuntu 16+, Debian 9+, çoğu modern distro) 

sudo nano /etc/systemd/system/elasiyanetwork.service


[Unit]
Description=ElasiyaNetwork - High-performance networking framework
After=network.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/elasiyanetwork
# Eğer config dosyası varsa ekle:
# Environment="CONFIG_PATH=/etc/elasiyanetwork/config.toml"
# veya argüman geçmek istersen:
# ExecStart=/usr/local/bin/elasiyanetwork --port 8080 --log-level debug

# Çalışacağı kullanıcı (root yerine normal kullanıcı önerilir)
User=sardor   # ← kendi kullanıcı adını yaz (veya root istiyorsan sil)
Group=sardor

# Çalışma dizini (log vs. için önemli olabilir)
WorkingDirectory=/home/sardor/elasiyanetwork   # veya binary'in olduğu yer

# Otomatik yeniden başlatma
Restart=always
RestartSec=5

# Logları journalctl ile gör
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target

# Systemd'e yeni servisi bildir
sudo systemctl daemon-reload

# Servisi test et (hata varsa log görürsün)
sudo systemctl start elasiyanetwork

# Durumunu kontrol et
sudo systemctl status elasiyanetwork

# Logları izle (çok faydalı)
journalctl -u elasiyanetwork -f

# Her reboot'ta otomatik başlasın
sudo systemctl enable elasiyanetwork
#Port < 1024 kullanıyorsa (80, 443 gibi) → ya root olarak çalıştır ya da setcap ile yetki ver

sudo setcap 'cap_net_bind_service=+ep' /usr/local/bin/elasiyanetwork

Environment değişkenleri lazımsa service dosyasına ekle:ini

Environment="ENV_VAR1=deger1"
Environment="ENV_VAR2=deger2"

