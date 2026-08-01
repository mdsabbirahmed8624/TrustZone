-- CreateTable
CREATE TABLE "device_diagnostics" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "technicianId" UUID NOT NULL,
    "batteryHealth" INTEGER NOT NULL DEFAULT 100,
    "storageRemainingGb" DECIMAL(10,2) NOT NULL,
    "screenStatus" TEXT NOT NULL DEFAULT 'OK',
    "cameraStatus" TEXT NOT NULL DEFAULT 'OK',
    "sensorStatus" TEXT NOT NULL DEFAULT 'OK',
    "bandwidthDownMbps" DECIMAL(10,2) NOT NULL,
    "diagnosticNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_diagnostics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_telemetry_logs" (
    "id" UUID NOT NULL,
    "technicianId" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "durationMin" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technician_telemetry_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_report_pdfs" (
    "id" UUID NOT NULL,
    "diagnosticId" UUID NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostic_report_pdfs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "device_diagnostics_ticketId_idx" ON "device_diagnostics"("ticketId");

-- CreateIndex
CREATE INDEX "device_diagnostics_technicianId_idx" ON "device_diagnostics"("technicianId");

-- CreateIndex
CREATE INDEX "technician_telemetry_logs_technicianId_idx" ON "technician_telemetry_logs"("technicianId");

-- CreateIndex
CREATE INDEX "technician_telemetry_logs_ticketId_idx" ON "technician_telemetry_logs"("ticketId");

-- CreateIndex
CREATE INDEX "diagnostic_report_pdfs_diagnosticId_idx" ON "diagnostic_report_pdfs"("diagnosticId");

-- AddForeignKey
ALTER TABLE "device_diagnostics" ADD CONSTRAINT "device_diagnostics_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_diagnostics" ADD CONSTRAINT "device_diagnostics_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_telemetry_logs" ADD CONSTRAINT "technician_telemetry_logs_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_telemetry_logs" ADD CONSTRAINT "technician_telemetry_logs_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_report_pdfs" ADD CONSTRAINT "diagnostic_report_pdfs_diagnosticId_fkey" FOREIGN KEY ("diagnosticId") REFERENCES "device_diagnostics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
