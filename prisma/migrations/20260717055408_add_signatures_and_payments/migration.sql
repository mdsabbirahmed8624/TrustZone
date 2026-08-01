-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'MOBILE_WALLET', 'BANK_TRANSFER', 'CORPORATE_ACCOUNT');

-- CreateTable
CREATE TABLE "work_order_signatures" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "signeeName" TEXT NOT NULL,
    "signatureUrl" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobile_payment_logs" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionRef" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mobile_payment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_order_signatures_ticketId_idx" ON "work_order_signatures"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "mobile_payment_logs_transactionRef_key" ON "mobile_payment_logs"("transactionRef");

-- CreateIndex
CREATE INDEX "mobile_payment_logs_ticketId_idx" ON "mobile_payment_logs"("ticketId");

-- AddForeignKey
ALTER TABLE "work_order_signatures" ADD CONSTRAINT "work_order_signatures_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobile_payment_logs" ADD CONSTRAINT "mobile_payment_logs_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
