/*
  Warnings:

  - You are about to drop the column `assignedWorkerId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_assignedWorkerId_fkey";

-- DropIndex
DROP INDEX "public"."Task_assignedWorkerId_key";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "assignedWorkerId";

-- CreateTable
CREATE TABLE "_WorkerTasks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WorkerTasks_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_WorkerTasks_B_index" ON "_WorkerTasks"("B");

-- AddForeignKey
ALTER TABLE "_WorkerTasks" ADD CONSTRAINT "_WorkerTasks_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkerTasks" ADD CONSTRAINT "_WorkerTasks_B_fkey" FOREIGN KEY ("B") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
