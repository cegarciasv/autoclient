#!/bin/sh
set -e

echo "══════════════════════════════════════════"
echo "  AutoClient — Grupo Remor"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "══════════════════════════════════════════"

# ── Extraer host y puerto desde DATABASE_URL ──────────────────
# Formato: mysql://usuario:password@host:puerto/basededatos
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|mysql://[^@]+@([^:/]+).*|\1|')
DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|.*@[^:]+:([0-9]+)/.*|\1|')
DB_PORT="${DB_PORT:-3306}"

# ── Esperar a que MySQL esté listo (max 60 s) ─────────────────
if [ -n "$DB_HOST" ]; then
  echo "→ Esperando MySQL en ${DB_HOST}:${DB_PORT} ..."
  TRIES=0
  until nc -z -w2 "$DB_HOST" "$DB_PORT" 2>/dev/null; do
    TRIES=$((TRIES + 1))
    if [ "$TRIES" -ge 30 ]; then
      echo "✗ Timeout: no se pudo conectar a ${DB_HOST}:${DB_PORT} después de 60 s"
      exit 1
    fi
    printf "  intento %d/30...\r" "$TRIES"
    sleep 2
  done
  echo "✓ MySQL disponible"
fi

# ── Aplicar schema a la base de datos ────────────────────────
if [ -d "./prisma/migrations" ] && [ "$(ls -A ./prisma/migrations 2>/dev/null)" ]; then
  echo "→ Aplicando migraciones (migrate deploy)..."
  ./node_modules/.bin/prisma migrate deploy
else
  echo "→ Sin migraciones encontradas — sincronizando schema (db push)..."
  ./node_modules/.bin/prisma db push --skip-generate
fi
echo "✓ Base de datos lista"

# ── Iniciar servidor Next.js ──────────────────────────────────
echo "→ Iniciando servidor en :${PORT:-3000} ..."
exec node server.js
