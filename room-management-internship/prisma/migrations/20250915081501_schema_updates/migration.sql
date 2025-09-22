/*
  Warnings:

  - You are about to drop the column `directorId` on the `Department` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Department" DROP CONSTRAINT "Department_directorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_id_fkey";

-- DropIndex
DROP INDEX "public"."Department_directorId_key";

-- AlterTable
ALTER TABLE "public"."Department" DROP COLUMN "directorId";
