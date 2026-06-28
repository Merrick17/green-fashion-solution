# Global Fashion Solution

Luxury fashion sourcing & product development platform — monorepo with Next.js web app and NestJS API.

## Stack

- **Web:** Next.js App Router, Tailwind v4, shadcn/ui, React Query, Fireworks AI (chat, vision, RAG, image gen)
- **API:** NestJS, Prisma, PostgreSQL, Redis, Socket.IO notifications
- **Storage:** Cloudinary (signed direct upload) with local dev fallback

## Quick start

```bash
docker compose up -d
cp .env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm install
cd apps/api && npx prisma migrate deploy && npx prisma db seed
cd ../.. && npm run dev
```

- Web: http://localhost:3001
- API: http://localhost:3000/api
- API docs: http://localhost:3000/api/docs

## Seed accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gfs.com | password123 |
| Customer | customer@gfs.com | password123 |
| Designer | designer@gfs.com | password123 |

## Docs

- [Deployment](docs/DEPLOYMENT.md)
- [Smoke test checklist](docs/SMOKE_TEST.md)
- [Runbook](docs/RUNBOOK.md)
- [Teams setup](docs/TEAMS_SETUP.md)
- [Architecture guide](CLAUDE.md)

## Portals

- `/` — landing & lead capture
- `/customer` — projects, moodboards, proposals, meetings
- `/designer` — fabric/product assets, tasks
- `/admin` — orchestration, proposals, lifecycle
