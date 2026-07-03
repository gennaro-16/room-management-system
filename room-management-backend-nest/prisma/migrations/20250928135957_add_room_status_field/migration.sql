-- CreateEnum
CREATE TYPE "public"."RoomStatus" AS ENUM ('FREE', 'BUSY', 'MAINTENANCE', 'RESERVED');

-- AlterTable
ALTER TABLE "public"."Room" ADD COLUMN     "status" "public"."RoomStatus" NOT NULL DEFAULT 'FREE';
