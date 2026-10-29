#!/usr/bin/env bash
# Sobe ou atualiza o SIGREST na VM: baixa o código mais novo do GitHub e reconstrói só o que mudou.
# Usado à mão (bash deploy/deploy.sh) e pelo deploy automático do GitHub Actions.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env.prod ]; then
  echo "Falta o .env.prod: rode antes o deploy/setup-vm.sh (ver DEPLOY.md)." >&2
  exit 1
fi

git pull --ff-only

docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build --remove-orphans

# Imagens antigas de builds anteriores ocupam o disco da VM à toa.
docker image prune -f >/dev/null

docker compose -f docker-compose.prod.yml --env-file .env.prod ps
