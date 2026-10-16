#!/usr/bin/env bash
# ─── Database Backup Script ────────────────────────────────────────────────────
# Usage: ./scripts/backup.sh [output_dir]
# Requires: pg_dump, environment variables from .env (or pass DATABASE_URL)
#
# Restore:
#   pg_restore -d $DATABASE_URL --clean --if-exists <backup_file.dump>

set -euo pipefail

BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/clinic_backup_${TIMESTAMP}.dump"

# Load .env if present and DATABASE_URL not already set
if [ -z "${DATABASE_URL:-}" ] && [ -f .env ]; then
  export $(grep -v '^#' .env | grep DATABASE_URL | xargs)
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "Starting backup to $BACKUP_FILE ..."
pg_dump "$DATABASE_URL" \
  --format=custom \
  --no-owner \
  --no-acl \
  --file="$BACKUP_FILE"

echo "Backup complete: $BACKUP_FILE"
echo ""
echo "To restore:"
echo "  pg_restore -d \"\$DATABASE_URL\" --clean --if-exists $BACKUP_FILE"
