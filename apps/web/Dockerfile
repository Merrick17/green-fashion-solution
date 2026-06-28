# ── Stage 1: install deps ─────────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

RUN npm install --force --workspace=web --include-workspace-root

# ── Stage 2: build ────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build --workspace=@repo/types
RUN npm run build --workspace=@repo/utils

WORKDIR /app/apps/web

# NEXT_PUBLIC_* vars are embedded into the JS bundle at build time
ARG NEXT_PUBLIC_API_URL=http://localhost:3000/api
ARG NEXT_PUBLIC_WS_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

# Sentry auth token injected as a build secret (never ends up in the image layer)
# In CI: --secret id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN 2>/dev/null || echo "") \
    npx next build

# ── Stage 3: production runner ────────────────────────────────────────
FROM node:24-alpine AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

WORKDIR /app/apps/web

# next build --standalone produces a self-contained server + minimal node_modules
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static     ./.next/static
COPY --from=builder /app/apps/web/public           ./public

RUN chown -R nextjs:nodejs /app/apps/web

USER nextjs
EXPOSE 3001
ENV PORT=3001
# Bind to all interfaces so Docker port mapping works
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
