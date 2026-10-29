#!/usr/bin/env bash
# Prepara uma VM Ubuntu da Oracle Cloud (Always Free) para rodar o SIGREST. Rodar UMA vez, de dentro
# da pasta do projeto clonado (ver DEPLOY.md):
#
#   SITE_DOMAIN=sigrest.duckdns.org ADMIN_EMAIL=voce@email.com bash deploy/setup-vm.sh
#
# Pode ser rodado de novo sem problema: cada passo verifica se já foi feito.
set -euo pipefail

cd "$(dirname "$0")/.."
PROJETO="$(pwd)"

echo "==> 1/6 Docker"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sudo sh
fi
sudo usermod -aG docker "$USER"

echo "==> 2/6 Firewall da VM (portas 80 e 443)"
# As imagens Ubuntu da Oracle vêm com iptables bloqueando tudo menos SSH. A regra de liberação tem de
# entrar ANTES do REJECT da cadeia INPUT. (As portas também precisam estar abertas na Security List
# da VCN, no console da Oracle — ver DEPLOY.md.)
for porta in 80 443; do
  if ! sudo iptables -C INPUT -p tcp -m state --state NEW --dport "$porta" -j ACCEPT 2>/dev/null; then
    pos=$(sudo iptables -L INPUT --line-numbers -n | awk '$2 == "REJECT" { print $1; exit }')
    if [ -n "$pos" ]; then
      sudo iptables -I INPUT "$pos" -p tcp -m state --state NEW --dport "$porta" -j ACCEPT
    else
      sudo iptables -A INPUT -p tcp -m state --state NEW --dport "$porta" -j ACCEPT
    fi
  fi
done
if command -v netfilter-persistent >/dev/null 2>&1; then
  sudo netfilter-persistent save
fi

echo "==> 3/6 Fuso horário"
sudo timedatectl set-timezone America/Sao_Paulo

echo "==> 4/6 Swap de 2 GB (margem para o build do frontend e do backend)"
if ! sudo swapon --show | grep -q '/swapfile'; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile >/dev/null
  sudo swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

echo "==> 5/6 Configuração de produção (.env.prod)"
if [ ! -f .env.prod ]; then
  if [ -z "${SITE_DOMAIN:-}" ]; then
    echo "Informe o domínio: SITE_DOMAIN=seu.dominio bash deploy/setup-vm.sh" >&2
    exit 1
  fi
  segredo() { openssl rand -hex "$1"; }
  sed \
    -e "s|^SITE_DOMAIN=.*|SITE_DOMAIN=${SITE_DOMAIN}|" \
    -e "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(segredo 24)|" \
    -e "s|^JWT_SECRET=.*|JWT_SECRET=$(segredo 32)|" \
    -e "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$(segredo 8)|" \
    .env.prod.example > .env.prod
  if [ -n "${ADMIN_EMAIL:-}" ]; then
    sed -i "s|^ADMIN_EMAIL=.*|ADMIN_EMAIL=${ADMIN_EMAIL}|" .env.prod
  fi
  chmod 600 .env.prod
  echo "    .env.prod criado com senhas aleatórias. Login inicial do admin:"
  grep -E '^ADMIN_(EMAIL|PASSWORD)=' .env.prod | sed 's/^/    /'
else
  echo "    .env.prod já existe, mantido como está."
fi

echo "==> 6/6 Backup diário do banco (03:00, guarda 30 dias)"
mkdir -p backups
linha="0 3 * * * cd ${PROJETO} && bash deploy/backup.sh >> backups/backup.log 2>&1"
( crontab -l 2>/dev/null | grep -v 'deploy/backup.sh' || true; echo "$linha" ) | crontab -

echo
echo "VM pronta. Para subir o sistema:  sudo -iu $USER bash -c 'cd ${PROJETO} && bash deploy/deploy.sh'"
echo "(ou saia e entre de novo no SSH para o grupo docker valer, e rode: bash deploy/deploy.sh)"
