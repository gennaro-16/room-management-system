/*
  Warnings:

  - You are about to drop the `_BookingInternalAttendees` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_BookingInternalAttendees" DROP CONSTRAINT "_BookingInternalAttendees_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_BookingInternalAttendees" DROP CONSTRAINT "_BookingInternalAttendees_B_fkey";

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "internalAttendees" TEXT[];

-- DropTable
DROP TABLE "public"."_BookingInternalAttendees";
