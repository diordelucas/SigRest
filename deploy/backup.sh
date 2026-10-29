#!/usr/bin/env bash
# Backup do banco de produção (pg_dump compactado) em backups/, apagando os com mais de 30 dias.
# O setup-vm.sh agenda este script no cron todo dia às 03:00. Para restaurar um backup:
#   gunzip -c backups/sigrest_AAAAMMDD_HHMM.sql.gz | docker compose -f docker-compose.prod.yml \
#     --env-file .env.prod exec -T db sh -c 'psql -U "$POSTGRES_USER" "$POSTGRES_DB"'
#
# Os backups ficam no disco da própria VM: de tempos em tempos, copie-os para fora dela
# (ex.: scp ubuntu@IP:SigRest/backups/*.gz .).
set -euo pipefail

cd "$(dirname "$0")/.."

mkdir -p backups
arquivo="backups/sigrest_$(date +%Y%m%d_%H%M).sql.gz"

# Usuário e banco vêm das variáveis do próprio container do Postgres.
docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T db \
  sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "$arquivo"

find backups -name 'sigrest_*.sql.gz' -mtime +30 -delete
echo "$(date '+%d/%m/%Y %H:%M') backup salvo em $arquivo"
