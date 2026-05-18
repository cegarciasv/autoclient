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

# ── Schema y migraciones ──────────────────────────────────────
COPY --from=builder --chown=nextjs:nodejs /app/prisma          ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

# ── Prisma CLI (instalación aislada con todas sus deps transitivas) ──
# Copiar /app/node_modules/prisma desde el builder no basta: el CLI carga
# @prisma/config en runtime, que a su vez requiere effect/c12/etc. — paquetes
# que viven en el top-level de node_modules y se perderían al cherry-picking.
# Tampoco vale copiar .bin/prisma (en Alpine es un symlink y COPY lo
# dereferencia, dejando el bundle sin sus WASMs adyacentes).
# Solución: instalación limpia en /prisma-cli + symlink en node_modules/prisma
# para que prisma.config.ts pueda resolver `import "prisma/config"`.
RUN mkdir /prisma-cli && cd /prisma-cli && \
    echo '{"name":"prisma-runner","version":"1.0.0","private":true}' > package.json && \
    npm install --no-package-lock --omit=dev prisma@7.8.0 && \
    ln -sf /prisma-cli/node_modules/prisma /app/node_modules/prisma && \
    chown -R nextjs:nodejs /prisma-cli

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
