-- CreateTable
CREATE TABLE "public"."BrowseHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bikeId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BrowseHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrowseHistory_userId_idx" ON "public"."BrowseHistory"("userId");

-- CreateIndex
CREATE INDEX "BrowseHistory_bikeId_idx" ON "public"."BrowseHistory"("bikeId");

-- CreateIndex
CREATE INDEX "BrowseHistory_userId_viewedAt_idx" ON "public"."BrowseHistory"("userId", "viewedAt");

-- AddForeignKey
ALTER TABLE "public"."BrowseHistory" ADD CONSTRAINT "BrowseHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BrowseHistory" ADD CONSTRAINT "BrowseHistory_bikeId_fkey" FOREIGN KEY ("bikeId") REFERENCES "public"."Bike"("id") ON DELETE CASCADE ON UPDATE CASCADE;
