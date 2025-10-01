/*
  Warnings:

  - A unique constraint covering the columns `[name,factoryId]` on the table `Skill` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `factoryId` to the `Skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `factoryId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `factoryId` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Skill_name_key";

-- AlterTable
ALTER TABLE "public"."Skill" ADD COLUMN     "factoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "factoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Worker" ADD COLUMN     "factoryId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Factory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Factory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Factory_name_key" ON "public"."Factory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_factoryId_key" ON "public"."Skill"("name", "factoryId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "public"."Factory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Skill" ADD CONSTRAINT "Skill_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "public"."Factory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Worker" ADD CONSTRAINT "Worker_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "public"."Factory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "public"."Factory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
