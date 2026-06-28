-- CreateTable
CREATE TABLE "proposal_ai_sessions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "modelId" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_ai_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_embedding_chunks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_embedding_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proposal_ai_sessions_projectId_userId_key" ON "proposal_ai_sessions"("projectId", "userId");

-- CreateIndex
CREATE INDEX "proposal_ai_sessions_userId_idx" ON "proposal_ai_sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_embedding_chunks_projectId_sourceKey_key" ON "ai_embedding_chunks"("projectId", "sourceKey");

-- CreateIndex
CREATE INDEX "ai_embedding_chunks_projectId_idx" ON "ai_embedding_chunks"("projectId");

-- AddForeignKey
ALTER TABLE "proposal_ai_sessions" ADD CONSTRAINT "proposal_ai_sessions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_ai_sessions" ADD CONSTRAINT "proposal_ai_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_embedding_chunks" ADD CONSTRAINT "ai_embedding_chunks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
