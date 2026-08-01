-- DropForeignKey
ALTER TABLE "warranties" DROP CONSTRAINT "warranties_branchId_fkey";

-- DropForeignKey
ALTER TABLE "warranty_claims" DROP CONSTRAINT "warranty_claims_branchId_fkey";

-- AlterTable
ALTER TABLE "warranties" ALTER COLUMN "branchId" DROP NOT NULL,
ALTER COLUMN "deviceBrand" SET DEFAULT 'Generic',
ALTER COLUMN "deviceModel" SET DEFAULT 'Generic',
ALTER COLUMN "serialOrImei" SET DEFAULT 'N/A';

-- AlterTable
ALTER TABLE "warranty_claims" ALTER COLUMN "branchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty_claims" ADD CONSTRAINT "warranty_claims_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
