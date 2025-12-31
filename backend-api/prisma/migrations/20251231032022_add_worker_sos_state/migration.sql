/*
  Warnings:

  - The primary key for the `_WorkerTasks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_WorkerTasks` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "isSOS" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "_WorkerTasks" DROP CONSTRAINT "_WorkerTasks_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_WorkerTasks_AB_unique" ON "_WorkerTasks"("A", "B");
