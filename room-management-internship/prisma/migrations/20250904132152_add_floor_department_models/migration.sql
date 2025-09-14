/*
  Warnings:

  - You are about to drop the column `department` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `floor` on the `Room` table. All the data in the column will be lost.
  - Added the required column `floorId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "public"."Floor" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Floor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Floor_number_key" ON "public"."Floor"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "public"."Department"("name");

-- Insert default floors based on existing room floors
INSERT INTO "public"."Floor" ("number", "name", "description", "createdAt", "updatedAt")
SELECT DISTINCT "floor", 'Floor ' || "floor", 'Floor ' || "floor", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "public"."Room";

-- Add floorId column to Room table
ALTER TABLE "public"."Room" ADD COLUMN "floorId" INTEGER;

-- Update Room table to set floorId based on existing floor values
UPDATE "public"."Room" 
SET "floorId" = "Floor"."id"
FROM "public"."Floor"
WHERE "Room"."floor" = "Floor"."number";

-- Make floorId NOT NULL
ALTER TABLE "public"."Room" ALTER COLUMN "floorId" SET NOT NULL;

-- Drop the old floor column
ALTER TABLE "public"."Room" DROP COLUMN "floor";

-- Add departmentId column to Booking table
ALTER TABLE "public"."Booking" ADD COLUMN "departmentId" INTEGER;

-- Drop the old department column
ALTER TABLE "public"."Booking" DROP COLUMN "department";

-- AddForeignKey
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "public"."Floor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
