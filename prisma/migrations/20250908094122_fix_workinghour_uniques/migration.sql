-- DropIndex
DROP INDEX "public"."WorkingHour_dealershipId_dayOfWeek_key";

-- AlterTable
ALTER TABLE "public"."DealershipInfo" ALTER COLUMN "email" SET DEFAULT 'contact.bikebay@gmail.com';
