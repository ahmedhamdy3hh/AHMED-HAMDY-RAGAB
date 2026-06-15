# 🚀 GO-LIVE & PRODUCTION VALIDATION PLAYBOOK

This playbook outlines the validation steps required to authorize, test, and launch the Cyber Guard Threat Management Platform.

---

## 1. Phase A: Pre-Deployment Infrastructure Checklist

Verify that the target operating platform is ready before running any service containers:

- [ ] **Infrastructure Provisioning:** Minimum 2 CPU Cores, 4GB RAM, and 50GB storage configured on the target Ubuntu Server.
- [ ] **Storage Persistence:** Native partition volumes directories (`pg-security-store`) created on non-volatile SSD layers and configured with read/write limits.
- [ ] **Docker Engine Verification:** System service verified via:
  ```bash
  docker info --format '{{json .SecurityOptions}}'
  ```
- [ ] **Firewall Ports Validation:** UFW or security groups verified to allow only ports 22, 80, and 443. External database ports (5432, 6379) must be blocked from public egress.

---

## 2. Phase B: Hardened Configurations & Secrets Checklist

Confirm all security controls are in place to project external environments:

- [ ] **Secret Keys Generation:** High-entropy signing keys (minimum 64-character hex strings) created using:
  ```bash
  openssl rand -hex 64
  ```
- [ ] **Database Credentials:** Default passwords replaced in the production environment configurations.
- [ ] **Gemini API Key:** Valid Google Client credentials configured and verified with a diagnostic cURL test:
  ```bash
  curl -H "Content-Type: application/json" -d "{...}" https://api.google-genai.com/v1/...
  ```
- [ ] **Nginx TLS Setup:** Valid SSL Certificates generated via Certbot. Automatic weekly Certbot cron renewals running:
  ```bash
  sudo systemctl status certbot.timer
  ```

---

## 3. Phase C: Operational Testing Checklist

Run these validation tests before routing live customer traffic:

- [ ] **Database Connection Health:**
  ```bash
  docker exec -it cyberguard-console node -e "/* probe connection health */"
  ```
- [ ] **Agent Registration Cycle:** Register a mock endpoint and verify that an mTLS certificate is successfully created.
- [ ] **Telemetry Pipeline & Threat Detection Heuristics:** Ingest a high-security event payload from a test host and verify that an alert is created.
- [ ] **Remediation Dispatch Playbook:** Trigger a host quarantine command from the dashboard and verify that the host's connection status is set to `Compromised`.
- [ ] **Security Analyzer AI Forensic Diagnostics:** Send a complex forensic syslog to `/api/v1/ai/analyze` and verify that the Gemini API returns a valid analysis in the expected JSON format.

---

## 4. Phase D: Go-Live Release Checklist

Follow these steps to complete the final application routing:

- [ ] **DNS Records Update:** Point your domain's public A record (`console.cyberguard.net`) to the Nginx proxy's elastic IP.
- [ ] **Nginx Config Check & Reload:**
  ```bash
  sudo nginx -t && sudo systemctl reload nginx
  ```
- [ ] **Scale Primary Instances:** Start your containers in production mode:
  ```bash
  docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
  ```
- [ ] **Continuous Monitoring:** Open the metrics server (`/api/v1/metrics`) in your browser to verify that Prometheus is receiving system health details.

---

## 5. Phase E: Post-Deployment Verification Checklist

Monitor system metrics during the first 24 hours of live operation to verify stability:

- [ ] **Database Backups:** Verify that the automated nightly backup script successfully exports the DB and uploads it to your secure offsite storage.
- [ ] **Container Restart Cycles:** Ensure no container restarts have occurred:
  ```bash
  docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Restarts}}"
  ```
- [ ] **Log Audits:** Inspect the system logs for warning parameters, connection drops, or unhandled exceptions:
  ```bash
  docker compose logs --tail=100 -f
  ```
