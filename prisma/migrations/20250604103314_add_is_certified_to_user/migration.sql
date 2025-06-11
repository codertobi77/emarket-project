/*
  Warnings:

  - The `location` column on the `markets` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Location" AS ENUM ('COTONOU', 'BOHICON', 'PORTO_NOVO');

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_marketId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_sellerId_fkey";

-- AlterTable
ALTER TABLE "markets" ADD COLUMN     "image" TEXT,
DROP COLUMN "location",
ADD COLUMN     "location" "Location" NOT NULL DEFAULT 'COTONOU';

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "sellerId" DROP NOT NULL,
ALTER COLUMN "marketId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "image" TEXT,
ADD COLUMN     "isCertified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" "Location",
ADD COLUMN     "session" TEXT;

-- CreateTable
CREATE TABLE "market_sellers" (
    "marketId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "market_sellers_pkey" PRIMARY KEY ("marketId","sellerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "market_sellers_marketId_key" ON "market_sellers"("marketId");

-- CreateIndex
CREATE UNIQUE INDEX "market_sellers_sellerId_key" ON "market_sellers"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "market_sellers_sellerId_marketId_key" ON "market_sellers"("sellerId", "marketId");

-- AddForeignKey
ALTER TABLE "market_sellers" ADD CONSTRAINT "market_sellers_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_sellers" ADD CONSTRAINT "market_sellers_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_sellerId_marketId_fkey" FOREIGN KEY ("sellerId", "marketId") REFERENCES "market_sellers"("sellerId", "marketId") ON DELETE SET NULL ON UPDATE CASCADE;
