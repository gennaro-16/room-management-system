-- CreateTable
CREATE TABLE "public"."Visitor" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Visit" (
    "id" SERIAL NOT NULL,
    "checkedIn" TIMESTAMP(3) NOT NULL,
    "checkedOut" TIMESTAMP(3),
    "purpose" TEXT,
    "bookingId" INTEGER NOT NULL,
    "visitorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Visit" ADD CONSTRAINT "Visit_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Visit" ADD CONSTRAINT "Visit_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "public"."Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
