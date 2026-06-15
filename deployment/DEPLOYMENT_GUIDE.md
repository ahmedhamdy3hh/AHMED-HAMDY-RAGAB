# 🛡️ CYBER GUARD PLATFORM: PRODUCTION DEPLOYMENT GUIDE
**System Release:** v1.1.0-STABLE  
**Target Operating Environment:** Ubuntu 24.04 LTS / Debian 12  
**Database Tier:** Highly Available PostgreSQL Cluster + Redis Cache Sentinel  
**AI Services:** Google Gemini Enterprise API

---

## 1. Architectural Overview

The Cyber Guard platform is built using a decentralized, multi-service architecture designed for FIPS compliance, multi-tenancy isolation, and linear horizontal scalability.

```
                  ┌────────────────────────────────────────┐
                  │          Public Client Browser         │
                  └───────────────────┬────────────────────┘
                                      │ (HTTPS / port 443)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │       Nginx Reverse Proxy / Load       │
                  │              Balancer Node             │
                  └───────────────────┬────────────────────┘
                                      │ (Internal Router / port 3000)
                                      ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                       Cyber Guard Trust Network                         │
    │                                                                         │
    │    ┌───────────────────┐    ┌────────────────────┐    ┌────────────┐    │
    │    │  Backend REST API │◄──►│  AI Threat Engine  │◄──►│ Redis Cache│    │
    │    │  (mTLS Auth Host) │    │  (Forensics Hub)   │    │ (Sync Node)│    │
    │    └─────────┬─────────┘    └────────────────────┘    └────────────┘    │
    │              │                                                          │
    │              ▼                                                          │
    │    ┌───────────────────┐                                                │
    │    │    PostgreSQL     │                                                │
    │    │  (RLS Data Store) │                                                │
    │    └───────────────────┘                                                │
    └────────────────────────────────────────────────----------------─────────┘
```

---

## 2. Hardening Host System (Ubuntu 24.04 LTS)

### A. Apply Latest Kernel Security Patches
```bash
sudo apt-get update && sudo apt-get dist-upgrade -y
sudo reboot
```

### B. Configure Uncomplicated Firewall (UFW)
Only expose secure HTTPS (Nginx reverse routing) and SSH on non-default ports:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH Secure Bound'
sudo ufw allow 80/tcp comment 'Web Redirect HTTP'
sudo ufw allow 443/tcp comment 'Secure Web TLS'
sudo ufw --force enable
```

### C. Install Docker Engine and Compose
```bash
# Add Docker's official GPG key
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add repository to Apt sources
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.p/docker.list > /dev/null

sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

---

## 3. Reverse Proxy & SSL Setup (Nginx)

Nginx handles TLS termination, HTTP security headers, and reverse proxies incoming client traffic to our primary backend container.

### A. Nginx Configuration Block
Save this configuration to `/etc/nginx/sites-available/cyberguard` and link it to `/etc/nginx/sites-enabled/`:

```nginx
# Rate Limiting configuration for preventative request throttling
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;

server {
    listen 80;
    server_name console.cyberguard.net;
    return 301 https://$host$request_uri; # Force TLS
}

server {
    listen 443 ssl http2;
    server_name console.cyberguard.net;

    # SSL / TLS Hardening Parameters
    ssl_certificate /etc/letsencrypt/live/console.cyberguard.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/console.cyberguard.net/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305...';

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.google-genai.com;" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Redirect client payloads to the Application Container Node
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Frame-Options "DENY";
        
        # Enforce API connection limit rules
        limit_req zone=api_limit burst=50 nodelay;
    }
}
```

### B. Certbot SSL Certificate Provisioning
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d console.cyberguard.net --non-interactive --agree-tos -m security@cyberguard.net
```

---

## 4. Run Core Services (Docker Compose)

### A. Environment Configuration
Create `/var/lib/cyberguard/.env` with your secrets (derived from `.env.production.example`):
```bash
mkdir -p /var/lib/cyberguard && chmod 700 /var/lib/cyberguard
cp ./docker/.env.production.example /var/lib/cyberguard/.env
# Update values using nano or vim to provide actual GEMINI_API_KEY
nano /var/lib/cyberguard/.env
```

### B. Deploy Stack
```bash
# Start cluster using extended production specifications
docker compose -f docker-compose.yml -f docker-compose.production.yml --env-file /var/lib/cyberguard/.env up -d
```

---

## 5. Enterprise Backup and Disaster Recovery

For continuous operations, automated snapshots of PostgreSQL volumes are configured.

### A. Database Backup Script (`/usr/local/bin/backup-postgres.sh`)
```bash
#!/usr/bin/env bash
set -eo pipefail

BACKUP_DIR="/var/backups/cyberguard"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
EXPORT_FILE="${BACKUP_DIR}/cyberguard-db-${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

echo "[BACKUP] Commencing PostgreSQL secure snapshot export..."
docker exec -t cyberguard-db pg_dump -U cyber_admin cyberguard_prod | gzip > "$EXPORT_FILE"
chmod 400 "$EXPORT_FILE"

# Upload to secure offsite vault (e.g. AWS S3 bucket with KMS encryption)
aws s3 cp "$EXPORT_FILE" s3://cyberguard-enterprise-vaults/databases/ --sse aws:kms

# Retain only past 30 archive logs locally
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -delete
echo "[BACKUP] Export complete and synced offsite securely."
```

### B. Setup Cron Execution (Standard Midnight Schedule)
```cron
0 0 * * * /usr/local/bin/backup-postgres.sh >> /var/log/cyberguard-backups.log 2>&1
```

---

## 6. Business Disaster Recovery Runbook

In the event of active datacenter outages:
1. **Infrastructure Re-provisioning:** Initialize a fresh Ubuntu Server in an alternative availability zone.
2. **Retrieve Databases:** Pull the latest PostgreSQL archive file from the offsite storage container.
3. **Deploy Container Stack:** Re-clone the repository, place `.env` secrets into context, and stand up containers.
4. **Restore Database:**
   ```bash
   gunzip -c cyberguard-db-latest.sql.gz | docker exec -i cyberguard-db psql -U cyber_admin -d cyberguard_prod
   ```
5. **DNS/CDN Failover:** Update Cloudflare or Route 53 DNS records to target the secondary active proxy node.
