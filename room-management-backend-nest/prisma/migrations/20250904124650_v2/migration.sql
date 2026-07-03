/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `floor` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Made the column `capacity` on table `Room` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."RoomStatus" AS ENUM ('FREE', 'BUSY', 'MAINTENANCE', 'RESERVED');

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_roomId_fkey";

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "purpose" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Room" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "floor" INTEGER NOT NULL,
ADD COLUMN     "status" "public"."RoomStatus" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "capacity" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "public"."Room"("name");

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
