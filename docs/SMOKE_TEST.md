# Manual Smoke Test Checklist

Run after each staging deploy.

## Auth
- [ ] Login as `customer@gfs.com` / `password123`
- [ ] Login as `designer@gfs.com` / `password123`
- [ ] Login as `admin@gfs.com` / `password123`
- [ ] Logout clears session; protected routes redirect to `/login`

## Customer
- [ ] Create project
- [ ] Upload image to moodboard (storage URL, not base64)
- [ ] AI moodboard chat streams response
- [ ] Browse inspiration; select asset
- [ ] View proposal; approve or request changes
- [ ] Request meeting

## Designer
- [ ] Upload fabric with file picker + keywords
- [ ] Upload product reference
- [ ] Complete assigned task

## Admin
- [ ] Assign task to designer
- [ ] Build proposal with AI assistant (RAG context present)
- [ ] Send proposal → customer notified (in-app + email if configured)
- [ ] Schedule meeting → Teams link or config banner
- [ ] Advance project status through lifecycle

## Ops
- [ ] `GET /api/health` returns 200
- [ ] `GET /api/ready` returns 200
