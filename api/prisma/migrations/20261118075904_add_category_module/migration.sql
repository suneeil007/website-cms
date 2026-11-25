-- CreateEnum
CREATE TYPE "CategoryModule" AS ENUM ('NEWS', 'PRODUCT', 'SERVICE');

-- DropIndex
DROP INDEX "categories_isActive_sortOrder_idx";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "module" "CategoryModule" NOT NULL DEFAULT 'NEWS';

-- CreateIndex
CREATE INDEX "categories_module_isActive_sortOrder_idx" ON "categories"("module", "isActive", "sortOrder");
