/*
  Warnings:

  - A unique constraint covering the columns `[dealershipId,dayOfWeek]` on the table `WorkingHour` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."WorkingHour_dayOfWeek_key";

-- DropIndex
DROP INDEX "public"."WorkingHour_dealershipId_key";

-- DropIndex
DROP INDEX "public"."WorkingHour_isOpen_key";

-- CreateIndex
CREATE INDEX "WorkingHour_dealershipId_idx" ON "public"."WorkingHour"("dealershipId");

-- CreateIndex
CREATE INDEX "WorkingHour_dayOfWeek_idx" ON "public"."WorkingHour"("dayOfWeek");

-- CreateIndex
CREATE INDEX "WorkingHour_isOpen_idx" ON "public"."WorkingHour"("isOpen");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingHour_dealershipId_dayOfWeek_key" ON "public"."WorkingHour"("dealershipId", "dayOfWeek");
