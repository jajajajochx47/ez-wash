/*
  Warnings:

  - A unique constraint covering the columns `[collectionId]` on the table `incomes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MachineType" ADD VALUE 'VENDING_MACHINE';
ALTER TYPE "MachineType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "incomes" ADD COLUMN     "collectionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "incomes_collectionId_key" ON "incomes"("collectionId");

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "machine_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
