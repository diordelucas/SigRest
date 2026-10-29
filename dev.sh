#!/bin/sh
# Sobe o SIGREST em modo desenvolvimento (recarga automática, sem reconstruir imagens).
# Ctrl+C para parar. Ver docker-compose.dev.yml.
exec docker compose -f docker-compose.yml -f docker-compose.dev.yml up "$@" db backend frontend
