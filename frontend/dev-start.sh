#!/bin/sh
# Usado pelo docker-compose.dev.yml: o node_modules fica num volume Docker (fora do OneDrive e do
# Windows), e as dependências só são reinstaladas quando o package-lock.json muda.
set -e

if ! sha1sum -c node_modules/.package-lock.sha1 >/dev/null 2>&1; then
  echo "[dev] instalando dependências do frontend (primeira vez ou package-lock.json alterado)..."
  npm ci --no-audit --no-fund
  sha1sum package-lock.json > node_modules/.package-lock.sha1
fi

exec npm start
