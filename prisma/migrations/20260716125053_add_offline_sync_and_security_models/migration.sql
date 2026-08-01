-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SUCCESS', 'CONFLICT', 'FAILED');

-- CreateEnum
CREATE TYPE "ResolutionStrategy" AS ENUM ('SERVER_WINS', 'CLIENT_WINS', 'MERGED', 'MANUAL_RESOLVE');

-- CreateTable
CREATE TABLE "offline_sync_batches" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "deviceUUID" TEXT NOT NULL,
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offline_sync_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_conflicts" (
    "id" UUID NOT NULL,
    "batchId" UUID NOT NULL,
    "entityName" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "clientVersion" JSONB NOT NULL,
    "serverVersion" JSONB NOT NULL,
    "resolvedStatus" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "strategy" "ResolutionStrategy" NOT NULL DEFAULT 'SERVER_WINS',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobile_security_policies" (
    "id" UUID NOT NULL,
    "blockJailbroken" BOOLEAN NOT NULL DEFAULT true,
    "requireBiometrics" BOOLEAN NOT NULL DEFAULT false,
    "certPinningHashes" TEXT[],
    "sessionTimeoutMin" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mobile_security_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "offline_sync_batches_userId_idx" ON "offline_sync_batches"("userId");

-- CreateIndex
CREATE INDEX "offline_sync_batches_deviceUUID_idx" ON "offline_sync_batches"("deviceUUID");

-- CreateIndex
CREATE INDEX "sync_conflicts_batchId_idx" ON "sync_conflicts"("batchId");

-- AddForeignKey
ALTER TABLE "sync_conflicts" ADD CONSTRAINT "sync_conflicts_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "offline_sync_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
