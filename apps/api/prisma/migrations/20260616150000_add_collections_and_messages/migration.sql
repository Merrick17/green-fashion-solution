-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "designerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "collection_items" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "fabricAssetId" TEXT,
    "productAssetId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "collection_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "message_threads" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_threads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderRole" "UserRole" NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'MESSAGE_RECEIVED';

CREATE INDEX "collections_designerId_idx" ON "collections"("designerId");
CREATE INDEX "collection_items_collectionId_idx" ON "collection_items"("collectionId");
CREATE INDEX "message_threads_customerId_idx" ON "message_threads"("customerId");
CREATE INDEX "messages_threadId_idx" ON "messages"("threadId");

ALTER TABLE "collections" ADD CONSTRAINT "collections_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_fabricAssetId_fkey" FOREIGN KEY ("fabricAssetId") REFERENCES "fabric_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_productAssetId_fkey" FOREIGN KEY ("productAssetId") REFERENCES "product_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "message_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
