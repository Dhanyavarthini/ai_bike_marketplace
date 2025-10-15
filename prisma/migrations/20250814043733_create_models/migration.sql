-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."BikeStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'SOLD');

-- CreateEnum
CREATE TYPE "public"."DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bike" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "mileage" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."BikeStatus" NOT NULL DEFAULT 'AVAILABLE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DealershipInfo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'BikeBay',
    "address" TEXT NOT NULL DEFAULT '123,BB Street',
    "phone" TEXT NOT NULL DEFAULT '+91 9876543210',
    "email" TEXT NOT NULL DEFAULT 'contact@bikebay.com',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealershipInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkingHour" (
    "id" TEXT NOT NULL,
    "dealershipId" TEXT NOT NULL,
    "dayOfWeek" "public"."DayOfWeek" NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkingHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSavedBike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bikeId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSavedBike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TestDriveBooking" (
    "id" TEXT NOT NULL,
    "bikeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookingDate" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestDriveBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "public"."User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Bike_make_model_idx" ON "public"."Bike"("make", "model");

-- CreateIndex
CREATE INDEX "Bike_category_idx" ON "public"."Bike"("category");

-- CreateIndex
CREATE INDEX "Bike_price_idx" ON "public"."Bike"("price");

-- CreateIndex
CREATE INDEX "Bike_year_idx" ON "public"."Bike"("year");

-- CreateIndex
CREATE INDEX "Bike_status_idx" ON "public"."Bike"("status");

-- CreateIndex
CREATE INDEX "Bike_fuelType_idx" ON "public"."Bike"("fuelType");

-- CreateIndex
CREATE INDEX "Bike_featured_idx" ON "public"."Bike"("featured");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingHour_dealershipId_dayOfWeek_key" ON "public"."WorkingHour"("dealershipId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingHour_dealershipId_key" ON "public"."WorkingHour"("dealershipId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingHour_dayOfWeek_key" ON "public"."WorkingHour"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingHour_isOpen_key" ON "public"."WorkingHour"("isOpen");

-- CreateIndex
CREATE INDEX "UserSavedBike_userId_idx" ON "public"."UserSavedBike"("userId");

-- CreateIndex
CREATE INDEX "UserSavedBike_bikeId_idx" ON "public"."UserSavedBike"("bikeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSavedBike_userId_bikeId_key" ON "public"."UserSavedBike"("userId", "bikeId");

-- CreateIndex
CREATE INDEX "TestDriveBooking_bikeId_idx" ON "public"."TestDriveBooking"("bikeId");

-- CreateIndex
CREATE INDEX "TestDriveBooking_userId_idx" ON "public"."TestDriveBooking"("userId");

-- CreateIndex
CREATE INDEX "TestDriveBooking_bookingDate_idx" ON "public"."TestDriveBooking"("bookingDate");

-- CreateIndex
CREATE INDEX "TestDriveBooking_status_idx" ON "public"."TestDriveBooking"("status");

-- AddForeignKey
ALTER TABLE "public"."WorkingHour" ADD CONSTRAINT "WorkingHour_dealershipId_fkey" FOREIGN KEY ("dealershipId") REFERENCES "public"."DealershipInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSavedBike" ADD CONSTRAINT "UserSavedBike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSavedBike" ADD CONSTRAINT "UserSavedBike_bikeId_fkey" FOREIGN KEY ("bikeId") REFERENCES "public"."Bike"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TestDriveBooking" ADD CONSTRAINT "TestDriveBooking_bikeId_fkey" FOREIGN KEY ("bikeId") REFERENCES "public"."Bike"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TestDriveBooking" ADD CONSTRAINT "TestDriveBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
