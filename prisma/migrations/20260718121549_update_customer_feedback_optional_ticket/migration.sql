-- DropForeignKey
ALTER TABLE "customer_feedbacks" DROP CONSTRAINT "customer_feedbacks_ticketId_fkey";

-- AlterTable
ALTER TABLE "customer_feedbacks" ADD COLUMN     "channel" TEXT DEFAULT 'WEB_PORTAL',
ALTER COLUMN "ticketId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "customer_feedbacks" ADD CONSTRAINT "customer_feedbacks_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
