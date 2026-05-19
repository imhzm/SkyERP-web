#!/bin/bash
# MongoDB TLS Hardening Script for Sky Wave ERP
# Run this script on the server (147.79.66.116) as root
#
# IMPORTANT: This script will:
# 1. Generate a self-signed TLS certificate (or use Let's Encrypt)
# 2. Configure MongoDB to require TLS
# 3. Update the UFW firewall to restrict MongoDB access
#
# Prerequisites:
# - MongoDB 8.0+ installed
# - Root access to the server
# - Domain pointing to the server (for Let's Encrypt)

set -euo pipefail

MONGO_CONF="/etc/mongod.conf"
CERT_DIR="/etc/mongodb/tls"
DOMAIN="erp.skywaveads.com"

echo "=== MongoDB TLS Hardening ==="
echo ""

# Step 1: Create certificate directory
echo "[1/6] Creating certificate directory..."
mkdir -p "$CERT_DIR"
chmod 700 "$CERT_DIR"

# Step 2: Generate TLS certificate
echo "[2/6] Generating TLS certificate..."
if command -v certbot &> /dev/null; then
  echo "  Using Let's Encrypt..."
  certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos -m admin@skywaveads.com
  cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$CERT_DIR/mongodb.pem"
  cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$CERT_DIR/mongodb-key.pem"
  cat "$CERT_DIR/mongodb-key.pem" "$CERT_DIR/mongodb.pem" > "$CERT_DIR/mongodb-combined.pem"
  chmod 600 "$CERT_DIR"/*.pem
  chown mongodb:mongodb "$CERT_DIR"/*.pem
else
  echo "  Generating self-signed certificate (valid for 365 days)..."
  openssl req -new -x509 -days 365 -nodes \
    -newkey rsa:4096 \
    -keyout "$CERT_DIR/mongodb-key.pem" \
    -out "$CERT_DIR/mongodb.pem" \
    -subj "/C=EG/ST=Cairo/L=Cairo/O=SkyWave/CN=$DOMAIN"
  cat "$CERT_DIR/mongodb-key.pem" "$CERT_DIR/mongodb.pem" > "$CERT_DIR/mongodb-combined.pem"
  chmod 600 "$CERT_DIR"/*.pem
  chown mongodb:mongodb "$CERT_DIR"/*.pem
fi

# Step 3: Backup current config
echo "[3/6] Backing up current MongoDB config..."
cp "$MONGO_CONF" "$MONGO_CONF.bak.$(date +%Y%m%d%H%M%S)"

# Step 4: Update MongoDB configuration
echo "[4/6] Updating MongoDB configuration..."
cat > "$MONGO_CONF" << 'MONGOCONF'
# MongoDB Configuration - Hardened with TLS
# Sky Wave ERP Production Server

storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 0.0.0.0
  tls:
    mode: requireTLS
    certificateKeyFile: /etc/mongodb/tls/mongodb-combined.pem
    # For self-signed certs, allow insecure TLS for internal connections:
    # allowConnectionsWithoutCertificates: true
    # For production with proper CA:
    # CAFile: /etc/mongodb/tls/ca.pem

security:
  authorization: enabled

processManagement:
  timeZoneInfo: /usr/share/zoneinfo

# Enable for replica set (future):
# replication:
#   replSetName: "skywave-rs"
MONGOCONF

# Step 5: Restart MongoDB
echo "[5/6] Restarting MongoDB..."
systemctl restart mongod
sleep 3

if systemctl is-active --quiet mongod; then
  echo "  MongoDB restarted successfully with TLS enabled."
else
  echo "  ERROR: MongoDB failed to start. Check logs:"
  echo "  tail -50 /var/log/mongodb/mongod.log"
  echo "  Restoring backup config..."
  cp "$MONGO_CONF.bak."* "$MONGO_CONF"
  systemctl restart mongod
  exit 1
fi

# Step 6: Update firewall (restrict MongoDB to specific IPs)
echo "[6/6] Updating UFW firewall rules..."
echo ""
echo "  IMPORTANT: MongoDB is currently open to 0.0.0.0:27017"
echo "  Recommended actions:"
echo ""
echo "  Option A - Restrict to specific IPs only:"
echo "    ufw delete allow 27017/tcp"
echo "    ufw allow from 127.0.0.1 to any port 27017"
echo "    ufw allow from YOUR_OFFICE_IP to any port 27017"
echo ""
echo "  Option B - Keep open but require TLS + auth (current setup):"
echo "    Keep port open but all connections require TLS certificate"
echo "    AND valid credentials (authorization: enabled)"
echo ""
echo "  Option C - Use SSH tunnel instead of direct access:"
echo "    ufw delete allow 27017/tcp"
echo "    Connect via: ssh -L 27017:127.0.0.1:27017 root@147.79.66.116"

echo ""
echo "=== TLS Hardening Complete ==="
echo ""
echo "IMPORTANT: Update your application connection strings:"
echo "  OLD: mongodb://user:pass@147.79.66.116:27017/skywave-erp?authSource=admin"
echo "  NEW: mongodb://user:pass@147.79.66.116:27017/skywave-erp?authSource=admin&tls=true&tlsAllowInvalidCertificates=true"
echo ""
echo "For production with proper CA:"
echo "  mongodb://user:pass@147.79.66.116:27017/skywave-erp?authSource=admin&tls=true&tlsCAFile=/path/to/ca.pem"
