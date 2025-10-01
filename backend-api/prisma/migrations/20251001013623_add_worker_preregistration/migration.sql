/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Worker` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[factoryId,employeeId]` on the table `Worker` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employeeId` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Worker" ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Worker_userId_key" ON "public"."Worker"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_factoryId_employeeId_key" ON "public"."Worker"("factoryId", "employeeId");

-- AddForeignKey
ALTER TABLE "public"."Worker" ADD CONSTRAINT "Worker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
