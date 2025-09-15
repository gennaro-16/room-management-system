/*
  Warnings:

  - Made the column `departmentId` on table `Room` required. This step will fail if there are existing NULL values in that column.
  - Made the column `departmentId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/

-- First, update NULL values with the first available department
-- Get the first department ID
WITH first_dept AS (
  SELECT id FROM "public"."Department" ORDER BY id LIMIT 1
)
UPDATE "public"."Room" 
SET "departmentId" = (SELECT id FROM first_dept)
WHERE "departmentId" IS NULL;

WITH first_dept AS (
  SELECT id FROM "public"."Department" ORDER BY id LIMIT 1
)
UPDATE "public"."User" 
SET "departmentId" = (SELECT id FROM first_dept)
WHERE "departmentId" IS NULL;

-- DropForeignKey
ALTER TABLE "public"."Room" DROP CONSTRAINT "Room_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_departmentId_fkey";

-- AlterTable
ALTER TABLE "public"."Room" ALTER COLUMN "departmentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "departmentId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
