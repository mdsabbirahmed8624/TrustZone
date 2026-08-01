/*
  Warnings:

  - The `priority` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `channel` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "body" TEXT,
ADD COLUMN     "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
DROP COLUMN "priority",
ADD COLUMN     "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
DROP COLUMN "channel",
ADD COLUMN     "channel" "NotificationChannel" NOT NULL DEFAULT 'WEBSOCKET';
