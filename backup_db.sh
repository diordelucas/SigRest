#!/usr/bin/env bash
# backup_db.sh — Cria um dump do banco PostgreSQL via container Docker
# Uso: ./backup_db.sh
# Requer: Docker em execução com o container sigrest_db ativo

set -euo pipefail

DB_USER="sigrest"
DB_NAME="sigrest"
CONTAINER="sigrest_db"
BACKUP_DIR="$(dirname "$0")/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "Gerando backup de '${DB_NAME}' no container '${CONTAINER}'..."
docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

echo "Backup salvo em: $BACKUP_FILE"
