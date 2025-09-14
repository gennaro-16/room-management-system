/*
  Warnings:

  - You are about to drop the column `departmentId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `floorId` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Floor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Room" DROP CONSTRAINT "Room_floorId_fkey";

-- AlterTable
ALTER TABLE "public"."Booking" DROP COLUMN "departmentId";

-- AlterTable
ALTER TABLE "public"."Room" DROP COLUMN "floorId",
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "width" INTEGER,
ADD COLUMN     "x" INTEGER,
ADD COLUMN     "y" INTEGER;

-- DropTable
DROP TABLE "public"."Department";

-- DropTable
DROP TABLE "public"."Floor";
