-- CreateTable
CREATE TABLE "prediction_histories" (
    "id" UUID NOT NULL,
    "predictionType" TEXT NOT NULL,
    "targetId" UUID NOT NULL,
    "predictionData" JSONB NOT NULL,
    "confidenceLevel" DOUBLE PRECISION NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediction_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_histories" (
    "id" UUID NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "targetId" UUID NOT NULL,
    "recommendationData" JSONB NOT NULL,
    "confidenceLevel" DOUBLE PRECISION NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_articles" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "category" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_searches" (
    "id" UUID NOT NULL,
    "query" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "articleId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_insights" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "churnRisk" DOUBLE PRECISION NOT NULL,
    "lifetimeValue" DOUBLE PRECISION NOT NULL,
    "satisfactionScore" DOUBLE PRECISION NOT NULL,
    "warrantyLikelihood" DOUBLE PRECISION NOT NULL,
    "insightData" JSONB,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demand_forecasts" (
    "id" UUID NOT NULL,
    "partId" UUID NOT NULL,
    "projectedDemand" DOUBLE PRECISION NOT NULL,
    "forecastPeriod" TEXT NOT NULL,
    "confidenceLevel" DOUBLE PRECISION NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "demand_forecasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repair_predictions" (
    "id" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "probableFault" TEXT NOT NULL,
    "suggestedRepairPath" TEXT[],
    "estimatedComplexity" TEXT NOT NULL,
    "estimatedPartsCost" DECIMAL(10,2) NOT NULL,
    "estimatedLaborCost" DECIMAL(10,2) NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repair_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_audit_logs" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "action" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "inputPayload" JSONB NOT NULL,
    "outputPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prediction_histories_predictionType_idx" ON "prediction_histories"("predictionType");

-- CreateIndex
CREATE INDEX "prediction_histories_targetId_idx" ON "prediction_histories"("targetId");

-- CreateIndex
CREATE INDEX "recommendation_histories_recommendationType_idx" ON "recommendation_histories"("recommendationType");

-- CreateIndex
CREATE INDEX "recommendation_histories_targetId_idx" ON "recommendation_histories"("targetId");

-- AddForeignKey
ALTER TABLE "knowledge_searches" ADD CONSTRAINT "knowledge_searches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_searches" ADD CONSTRAINT "knowledge_searches_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "knowledge_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_insights" ADD CONSTRAINT "customer_insights_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demand_forecasts" ADD CONSTRAINT "demand_forecasts_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repair_predictions" ADD CONSTRAINT "repair_predictions_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_audit_logs" ADD CONSTRAINT "ai_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
