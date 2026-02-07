## Docker Kullanımı

  Copy Right  Efe Kaya 

```bash
# 
docker build -t elasiyanetwork:latest .

# 
docker run -d -p 8080:8080 --name elasiya-server elasiyanetwork:latest

# 
docker run -d -p 9000:9000 -e PORT=9000 elasiyanetwork:latest

# 
docker compose up -d --build