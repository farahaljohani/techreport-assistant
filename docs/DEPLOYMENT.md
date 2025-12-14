# Deployment Guide

## Local Development with Docker

### Prerequisites
- Docker Desktop (https://docs.docker.com/get-docker/)
- OpenAI API Key
- Git

### Quick Start
```bash
# Clone & setup
git clone https://github.com/farahaljohani/techreport-assistant.git
cd techreport-assistant

# Configure
cp .env.example .env
# Edit .env with your OpenAI API key

# Run
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Production Deployment

### Option 1: DigitalOcean App Platform

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Create App on DigitalOcean**
   - Go to app.digitalocean.com
   - Click "Create App"
   - Select GitHub repo
   - Configure services (backend, frontend, nginx)

3. **Set Environment Variables**
   - Add `OPENAI_API_KEY` in DigitalOcean dashboard
   - Set domain names

4. **Deploy**
   - Click "Deploy"

### Option 2: AWS ECS (Elastic Container Service)

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Tag images
docker tag techreport-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/techreport-backend:latest
docker tag techreport-frontend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/techreport-frontend:latest

# Push images
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/techreport-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/techreport-frontend:latest

# Create ECS task definitions and services
# (See AWS documentation for full setup)
```

### Option 3: Render

1. Create `render.yaml` in root:
```yaml
services:
  - type: web
    name: techreport-backend
    env: docker
    dockerfilePath: backend/Dockerfile
    envVars:
      - key: OPENAI_API_KEY
        sync: false
  
  - type: web
    name: techreport-frontend
    env: docker
    dockerfilePath: frontend/Dockerfile.prod
```

2. Connect GitHub repo to Render
3. Deploy

### Option 4: VPS (Linode, Vultr, etc.)

```bash
# SSH into server
ssh root@your_server_ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repo
git clone https://github.com/farahaljohani/techreport-assistant.git
cd techreport-assistant

# Configure
cp .env.example .env
nano .env  # Add OpenAI key

# Run production
docker-compose -f docker-compose.prod.yml up -d
```

### Option 5: Kubernetes (Advanced)

```bash
# Create namespace
kubectl create namespace techreport

# Create secrets
kubectl create secret generic openai-key \
  --from-literal=OPENAI_API_KEY=sk-... \
  -n techreport

# Deploy using Helm or kubectl
kubectl apply -f k8s/
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Update nginx.conf with SSL paths
# (Certificates will be in /etc/letsencrypt/live/)

# Reload nginx
docker-compose exec nginx nginx -s reload
```

### Update nginx.conf for HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    
    # ...rest of config...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Environment Variables for Production

```
OPENAI_API_KEY=sk-...
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
ENVIRONMENT=production
```

---

## Monitoring & Logging

### Docker Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Log Management
- Use ELK Stack (Elasticsearch, Logstash, Kibana)
- Use Datadog, New Relic, or CloudWatch for APM

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000

# API status
curl http://localhost:8000/docs
```

---

## Scaling

### Horizontal Scaling (Multiple Instances)

With Docker Compose:
```yaml
services:
  backend:
    deploy:
      replicas: 3
```

### Load Balancing with Nginx
Already configured in `nginx/nginx.conf`

### Database Scaling (Future)
When adding database:
- Use managed database services (RDS, CloudSQL)
- Implement connection pooling
- Use read replicas

---

## Backup & Recovery

### Backup Uploads
```bash
# Backup volume
docker run --rm -v techreport_backend_uploads:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/uploads-$(date +%Y%m%d).tar.gz /data
```

### Restore
```bash
docker run --rm -v techreport_backend_uploads:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/uploads-20240101.tar.gz -C /data
```

---

## Troubleshooting Production

### Check Container Status
```bash
docker-compose ps
docker-compose logs backend
```

### Rebuild & Redeploy
```bash
docker-compose down
docker-compose up --build -d
```

### Memory Issues
```bash
# Increase memory limit
docker run -m 2g
```

### SSL Renewal
```bash
# Auto-renew with Certbot
sudo certbot renew --dry-run
```

---

## Performance Optimization

1. **Frontend**
   - Enable gzip compression in Nginx
   - Use CDN for static assets
   - Minify CSS/JS

2. **Backend**
   - Use Gunicorn workers (4x CPU cores)
   - Enable caching for API responses
   - Optimize PDF parsing

3. **Database** (When added)
   - Index common queries
   - Use connection pooling
   - Monitor slow queries

4. **Infrastructure**
   - Use managed services
   - Enable auto-scaling
   - Monitor CPU/Memory

---

## Security Checklist

- [ ] Change default passwords
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable API rate limiting (already in nginx)
- [ ] Regular backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep dependencies updated
- [ ] Use strong OpenAI API key
- [ ] Implement CORS properly

---

## Support & Maintenance

- Monitor logs regularly
- Update dependencies monthly
- Backup data weekly
- Test disaster recovery
- Document any custom changes
