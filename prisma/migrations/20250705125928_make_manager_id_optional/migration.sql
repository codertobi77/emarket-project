-- DropForeignKey
ALTER TABLE "markets" DROP CONSTRAINT "markets_managerId_fkey";

-- AlterTable
ALTER TABLE "markets" ALTER COLUMN "managerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "markets" ADD CONSTRAINT "markets_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
