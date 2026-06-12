# backup_db.ps1 — Cria um dump do banco PostgreSQL via container Docker
# Uso: .\backup_db.ps1
# Requer: Docker em execução com o container sigrest_db ativo

$ErrorActionPreference = "Stop"

$DB_USER     = "sigrest"
$DB_NAME     = "sigrest"
$CONTAINER   = "sigrest_db"
$BACKUP_DIR  = "$PSScriptRoot\backups"
$TIMESTAMP   = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR\backup_${TIMESTAMP}.sql"

if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
}

Write-Host "Gerando backup de '$DB_NAME' no container '$CONTAINER'..."
docker exec $CONTAINER pg_dump -U $DB_USER $DB_NAME | Out-File -FilePath $BACKUP_FILE -Encoding utf8

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao gerar o backup. Verifique se o container esta em execucao."
    exit 1
}

Write-Host "Backup salvo em: $BACKUP_FILE"
