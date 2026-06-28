-- Index for project-scoped message thread lookups
CREATE INDEX IF NOT EXISTS "message_threads_projectId_idx" ON "message_threads"("projectId");
