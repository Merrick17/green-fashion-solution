# Operations Runbook

## Restart order

1. Postgres + Redis
2. API (`npm run start:prod` or container)
3. Web (Vercel redeploy or `npm run start`)

## Prisma client locked (Windows EPERM)

Stop API dev server, then:

```bash
cd apps/api && npx prisma generate
```

## Apply migrations

```bash
cd apps/api && npx prisma migrate deploy
```

## Rotate JWT secrets

1. Set new `JWT_SECRET` + `JWT_REFRESH_SECRET` on API and web
2. Redeploy both apps
3. All users must re-login

## Storage outage

- Uploads fail at presign step
- Check `S3_*` env vars and bucket permissions
- Dev fallback: unset S3 vars → local `/uploads` (development only)

## Ollama Cloud outage

- AI routes return 503
- Set `AI_ENABLE_RAG=false` to disable RAG indexing
- Moodboard/proposal forms still work manually

## Database backup

Use provider-native daily backups (Neon/Supabase/RDS). Test restore quarterly.
