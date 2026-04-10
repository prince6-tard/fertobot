#!/bin/bash

# FertoBot Database Backup Script

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p "$BACKUP_DIR"

echo "Starting MongoDB backup..."

# Backup MongoDB
docker exec fertobot-mongodb mongodump \
  -u fertobot \
  -p fertobot123 \
  --authenticationDatabase admin \
  --out "$BACKUP_DIR/mongodb_backup_$TIMESTAMP"

# Compress backup
cd "$BACKUP_DIR"
tar -czf "mongodb_backup_$TIMESTAMP.tar.gz" "mongodb_backup_$TIMESTAMP"
rm -rf "mongodb_backup_$TIMESTAMP"
cd ..

echo "✓ MongoDB backup completed: $BACKUP_DIR/mongodb_backup_$TIMESTAMP.tar.gz"

# Keep only last 7 backups
echo "Cleaning old backups..."
ls -t "$BACKUP_DIR"/mongodb_backup_*.tar.gz | tail -n +8 | xargs -r rm

echo "✓ Backup cleanup completed"
