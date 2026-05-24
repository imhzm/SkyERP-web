#!/bin/bash
# Load environment variables from .env.production.local
set -a
source /var/www/erp.skywaveads.com/.env.production.local
set +a

# Start Next.js
cd /var/www/erp.skywaveads.com
npm run start -- -p 3300 -H 127.0.0.1
