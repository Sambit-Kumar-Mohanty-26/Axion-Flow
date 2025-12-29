-- CreateTable
CREATE TABLE "LocationLog" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LocationLog_factoryId_timestamp_idx" ON "LocationLog"("factoryId", "timestamp");

-- AddForeignKey
ALTER TABLE "LocationLog" ADD CONSTRAINT "LocationLog_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationLog" ADD CONSTRAINT "LocationLog_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
