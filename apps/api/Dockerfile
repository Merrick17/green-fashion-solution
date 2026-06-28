# ── Stage 1: install deps ─────────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app

# Copy manifests only — maximises layer cache hit rate
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

RUN npm install --force \
    --workspace=@repo/types \
    --workspace=@repo/utils \
    --workspace=api \
    --include-workspace-root

# ── Stage 2: build ────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build shared packages before the API (NestJS imports from them at runtime)
RUN npm run build --workspace=@repo/types
RUN npm run build --workspace=@repo/utils

WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

# ── Stage 3: production runner ────────────────────────────────────────
FROM node:24-alpine AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nestjs

WORKDIR /app

# Shared packages must be present — node_modules/@repo/* symlinks resolve here
COPY --from=builder /app/packages ./packages

# Root-hoisted node_modules (includes Prisma CLI + all production deps)
COPY --from=builder /app/node_modules ./node_modules

# API compiled output
COPY --from=builder /app/apps/api/dist         ./apps/api/dist
COPY --from=builder /app/apps/api/prisma       ./apps/api/prisma
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json

RUN mkdir -p /app/apps/api/uploads \
 && chown -R nestjs:nodejs /app/apps/api/uploads

USER nestjs
WORKDIR /app/apps/api
EXPOSE 3000

# Prisma detects already-applied migrations and skips them — safe on every restart.
CMD ["sh", "-c", \
  "/app/node_modules/.bin/prisma migrate deploy --schema /app/apps/api/prisma/schema.prisma \
   && node dist/src/main.js"]
