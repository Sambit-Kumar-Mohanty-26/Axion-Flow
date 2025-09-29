-- CreateEnum
CREATE TYPE "public"."WorkerStatus" AS ENUM ('AVAILABLE', 'ON_TASK', 'ON_BREAK', 'ABSENT');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "public"."Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Worker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."WorkerStatus" NOT NULL DEFAULT 'AVAILABLE',
    "fatigueLevel" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "location_x" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "location_y" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkerSkill" (
    "workerId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "proficiency" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "WorkerSkill_pkey" PRIMARY KEY ("workerId","skillId")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "public"."TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "requiredSkillId" TEXT,
    "assignedWorkerId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "public"."Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Task_assignedWorkerId_key" ON "public"."Task"("assignedWorkerId");

-- AddForeignKey
ALTER TABLE "public"."WorkerSkill" ADD CONSTRAINT "WorkerSkill_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkerSkill" ADD CONSTRAINT "WorkerSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_requiredSkillId_fkey" FOREIGN KEY ("requiredSkillId") REFERENCES "public"."Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_assignedWorkerId_fkey" FOREIGN KEY ("assignedWorkerId") REFERENCES "public"."Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
