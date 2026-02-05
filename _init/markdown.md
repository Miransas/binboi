## Docker Kullanımı

Projeyi Docker ile çalıştırmak çok basit:

```bash
# Image'i build et
docker build -t elasiyanetwork:latest .

# Çalıştır (8080 portunda)
docker run -d -p 8080:8080 --name elasiya-server elasiyanetwork:latest

# Farklı port ile çalıştırmak istersen
docker run -d -p 9000:9000 -e PORT=9000 elasiyanetwork:latest

# Veya docker-compose ile (daha kolay)
docker compose up -d --build