# Deployment Guide

## Environments

| Env | API | Web | Database | Redis |
|-----|-----|-----|----------|-------|
| Local | `:3000` | `:3001` | Docker `:5433` | Docker `:6379` |
| Staging | Railway/Fly | Vercel | Neon/Supabase | Upstash |
| Production | Railway/Fly | Vercel | Managed Postgres | Upstash |

## Local setup

```bash
docker compose up -d
cp .env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm install
cd apps/api && npx prisma migrate deploy && npx prisma db seed
npm run dev
```

## API (Docker)

```bash
docker build -f apps/api/Dockerfile -t gfs-api .
docker run -p 3000:3000 --env-file apps/api/.env gfs-api
```

## Web (Vercel)

1. Root directory: `apps/web`
2. Set env vars from `apps/web/.env.example`
3. `JWT_SECRET` must match API
4. `NEXT_PUBLIC_API_URL` → production API `/api`

## Required production secrets

- `DATABASE_URL`, `REDIS_URL`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `S3_*` (R2/S3 for all uploads)
- `FIREWORKS_API_KEY` (chat, vision, RAG embeddings, image gen)
- `RESEND_API_KEY`, `EMAIL_FROM` (notifications)
- `AZURE_*` (optional Teams meetings)

## Migrations

```bash
cd apps/api && npx prisma migrate deploy
```

Optional pgvector (after `pgvector/pgvector` Postgres image):

```bash
cd apps/api && npx prisma db execute --schema prisma/schema.prisma --file prisma/migrations/optional_pgvector.sql
```

Never use `db push` in production.
