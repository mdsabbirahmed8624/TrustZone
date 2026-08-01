-- CreateTable
CREATE TABLE "analytics_snapshots" (
    "id" UUID NOT NULL,
    "snapshotType" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_reports" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "recipients" TEXT[],
    "branchId" UUID,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduled_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_metrics" (
    "id" UUID NOT NULL,
    "metricKey" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "branchId" UUID,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_configurations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "formulaKey" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_histories" (
    "id" UUID NOT NULL,
    "scheduledReportId" UUID,
    "reportName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "generatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_analytics" (
    "id" UUID NOT NULL,
    "alertType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alert_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forecast_histories" (
    "id" UUID NOT NULL,
    "forecastType" TEXT NOT NULL,
    "historicalData" JSONB NOT NULL,
    "projectedData" JSONB NOT NULL,
    "confidenceLevel" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forecast_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_snapshots_snapshotType_idx" ON "analytics_snapshots"("snapshotType");

-- CreateIndex
CREATE INDEX "analytics_snapshots_createdAt_idx" ON "analytics_snapshots"("createdAt");

-- CreateIndex
CREATE INDEX "business_metrics_metricKey_idx" ON "business_metrics"("metricKey");

-- CreateIndex
CREATE INDEX "business_metrics_recordedAt_idx" ON "business_metrics"("recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_configurations_formulaKey_key" ON "kpi_configurations"("formulaKey");

-- CreateIndex
CREATE INDEX "alert_analytics_alertType_idx" ON "alert_analytics"("alertType");

-- CreateIndex
CREATE INDEX "alert_analytics_isResolved_idx" ON "alert_analytics"("isResolved");

-- CreateIndex
CREATE INDEX "forecast_histories_forecastType_idx" ON "forecast_histories"("forecastType");

-- AddForeignKey
ALTER TABLE "report_histories" ADD CONSTRAINT "report_histories_scheduledReportId_fkey" FOREIGN KEY ("scheduledReportId") REFERENCES "scheduled_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_histories" ADD CONSTRAINT "report_histories_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
