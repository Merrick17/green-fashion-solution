-- CreateTable
CREATE TABLE "proposal_change_requests" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "proposal_change_requests_proposalId_idx" ON "proposal_change_requests"("proposalId");

-- CreateIndex
CREATE INDEX "proposal_change_requests_customerId_idx" ON "proposal_change_requests"("customerId");

-- AddForeignKey
ALTER TABLE "proposal_change_requests" ADD CONSTRAINT "proposal_change_requests_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_change_requests" ADD CONSTRAINT "proposal_change_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
