# ─────────────────────────────────────────────────────────────
#  Stage 1 — Dependencias
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Instalar dependencias nativas que Prisma y pdfkit necesitan
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
# npm ci instala TODO (incluyendo devDeps) para poder compilar
RUN npm ci


# ─────────────────────────────────────────────────────────────
#  Stage 2 — Build
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

# Copiar node_modules del stage anterior (evita reinstalar)
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma Client (se guarda en app/generated/prisma/)
RUN npx prisma generate

# Build de Next.js → produce .next/standalone gracias a output:"standalone"
RUN npm run build


# ─────────────────────────────────────────────────────────────
#  Stage 3 — Runner (imagen final, mínima)
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# openssl  → motor de migración de Prisma
# netcat-openbsd → wait-for-db en entrypoint.sh
RUN apk add --no-cache openssl netcat-openbsd

# Usuario sin privilegios
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# ── Artefactos del build ──────────────────────────────────────
# El output "standalone" incluye todo lo necesario para ejecutar Next.js:
# server.js, .next/, y node_modules con las dependencias trazadas.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

# ── Prisma CLI + engines (para migrate deploy en entrypoint) ──
# No están en el standalone porque no son importados por el código de la app.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma      ./node_modules/.bin/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma            ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma           ./node_modules/@prisma

# ── Schema y migraciones ──────────────────────────────────────
COPY --from=builder --chown=nextjs:nodejs /app/prisma          ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

# ── pdfkit y sus dependencias ─────────────────────────────────
# serverExternalPackages evita que Turbopack lo bundle, pero en standalone
# es posible que no quede en el trace. Lo copiamos explícitamente.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pdfkit           ./node_modules/pdfkit
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/fontkit           ./node_modules/fontkit
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/linebreak         ./node_modules/linebreak
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/unicode-properties ./node_modules/unicode-properties
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/brotli            ./node_modules/brotli
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/restructure       ./node_modules/restructure
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tiny-inflate      ./node_modules/tiny-inflate
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/unicode-trie      ./node_modules/unicode-trie
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/dfa               ./node_modules/dfa

# ── Conector MariaDB (driver adapter, usualmente ya en standalone) ──
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/mariadb           ./node_modules/mariadb
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/adapter-mariadb ./node_modules/@prisma/adapter-mariadb

# ── Entrypoint ────────────────────────────────────────────────
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./entrypoint.sh"]
