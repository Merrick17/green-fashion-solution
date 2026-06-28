-- AlterTable
ALTER TABLE "fabric_assets" ADD COLUMN "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "product_assets" ADD COLUMN "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[];
