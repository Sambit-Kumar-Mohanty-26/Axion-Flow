-- DropIndex
DROP INDEX "public"."Skill_name_factoryId_key";

-- AlterTable
ALTER TABLE "public"."Worker" ALTER COLUMN "employeeId" DROP NOT NULL;
