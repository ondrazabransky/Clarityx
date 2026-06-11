-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AUDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'WAITING_FOR_CLIENT', 'REVIEW', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AuditType" AS ENUM ('QUICK_IT_AUDIT', 'COMPLETE_IT_AUDIT', 'CYBERSECURITY_AUDIT', 'NIS2_READINESS', 'ISO27001_GAP', 'MICROSOFT365_SECURITY', 'BACKUP_DR', 'NETWORK_INFRASTRUCTURE', 'ENDPOINT_DEVICE_MANAGEMENT', 'WEB_APPLICATION_SECURITY');

-- CreateEnum
CREATE TYPE "AnswerValue" AS ENUM ('YES', 'MOSTLY_YES', 'PARTIAL', 'MOSTLY_NO', 'NO', 'NOT_RELEVANT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('OPEN', 'ACCEPTED', 'IN_PROGRESS', 'IMPLEMENTED', 'VERIFIED', 'RISK_ACCEPTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('P1', 'P2', 'P3', 'P4');

-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'DONE', 'DEFERRED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('EXECUTIVE', 'TECHNICAL', 'NIS2_READINESS');

-- CreateEnum
CREATE TYPE "MappingStrength" AS ENUM ('PRIMARY', 'SECONDARY', 'SUPPORTING');

-- CreateEnum
CREATE TYPE "ComplianceImpact" AS ENUM ('BLOCKS_COMPLIANCE', 'WEAKENS_COMPLIANCE', 'EVIDENCE_MISSING', 'IMPROVEMENT_ONLY');

-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('NOT_ASSESSED', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT', 'MOSTLY_COMPLIANT', 'COMPLIANT', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "EvidenceStatus" AS ENUM ('EVIDENCE_COMPLETE', 'EVIDENCE_PARTIAL', 'EVIDENCE_MISSING', 'EVIDENCE_NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "EvidenceQuality" AS ENUM ('STRONG', 'MEDIUM', 'WEAK', 'MISSING');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('ESSENTIAL_ENTITY', 'IMPORTANT_ENTITY', 'NOT_IN_SCOPE', 'UNKNOWN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ico" TEXT,
    "industry" TEXT,
    "employeeCount" INTEGER,
    "revenueRange" TEXT,
    "country" TEXT NOT NULL DEFAULT 'CZ',
    "description" TEXT,
    "isNis2InScope" BOOLEAN NOT NULL DEFAULT false,
    "entityType" "EntityType" NOT NULL DEFAULT 'UNKNOWN',
    "sector" TEXT,
    "subsector" TEXT,
    "sizeCriterion" TEXT,
    "revenueCriterion" TEXT,
    "employeeCriterion" TEXT,
    "criticalService" TEXT,
    "nis2Notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "auditType" "AuditType" NOT NULL DEFAULT 'COMPLETE_IT_AUDIT',
    "status" "AuditStatus" NOT NULL DEFAULT 'DRAFT',
    "maturityLevel" TEXT,
    "overallScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "itScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cybersecurityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nis2Score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditSection" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "AuditSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditQuestion" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "framework" TEXT,
    "controlReference" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "maturityLevel" INTEGER NOT NULL DEFAULT 1,
    "evidenceRequired" BOOLEAN NOT NULL DEFAULT false,
    "recommendationTemplate" TEXT,
    "riskIfMissing" TEXT,
    "order" INTEGER NOT NULL,
    "nis2Relevant" BOOLEAN NOT NULL DEFAULT false,
    "nis2RequirementCode" TEXT,
    "nis2Article" TEXT,
    "nis2Category" TEXT,
    "nis2MappingStrength" "MappingStrength",
    "nis2EvidenceRequired" BOOLEAN NOT NULL DEFAULT false,
    "nis2GapImpact" "ComplianceImpact",
    "nis2Recommendation" TEXT,

    CONSTRAINT "AuditQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditAnswer" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" "AnswerValue" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maturityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "comment" TEXT,
    "evidenceUrl" TEXT,
    "responsiblePerson" TEXT,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "questionId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "likelihood" INTEGER NOT NULL,
    "impact" INTEGER NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "status" "FindingStatus" NOT NULL DEFAULT 'OPEN',
    "recommendation" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'P3',
    "owner" TEXT,
    "dueDate" TIMESTAMP(3),
    "effort" TEXT,
    "costEstimate" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "findingId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'P3',
    "effort" TEXT,
    "costEstimate" DECIMAL(12,2),
    "benefit" TEXT,
    "targetState" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapItem" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'P3',
    "quarter" TEXT NOT NULL,
    "status" "RoadmapStatus" NOT NULL DEFAULT 'PLANNED',
    "owner" TEXT,
    "dueDate" TIMESTAMP(3),
    "estimatedCost" DECIMAL(12,2),
    "isNis2" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "questionId" TEXT,
    "findingId" TEXT,
    "requirementId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "description" TEXT,
    "evidenceType" TEXT,
    "evidenceQuality" "EvidenceQuality" NOT NULL DEFAULT 'MISSING',
    "evidenceDate" TIMESTAMP(3),
    "evidenceOwner" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditReport" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "reportType" "ReportType" NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileUrl" TEXT,
    "summary" TEXT,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "AuditReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceFramework" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT,
    "country" TEXT,
    "validFrom" TIMESTAMP(3),
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceFramework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceRequirement" (
    "id" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "article" TEXT,
    "paragraph" TEXT,
    "category" TEXT NOT NULL,
    "requirementType" TEXT NOT NULL,
    "mandatory" BOOLEAN NOT NULL DEFAULT true,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "recommendedEvidence" JSONB,
    "recommendedActions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditQuestionComplianceMapping" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "mappingStrength" "MappingStrength" NOT NULL,
    "mappingNote" TEXT,

    CONSTRAINT "AuditQuestionComplianceMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FindingComplianceMapping" (
    "id" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "impactOnCompliance" "ComplianceImpact" NOT NULL,
    "note" TEXT,

    CONSTRAINT "FindingComplianceMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceAssessment" (
    "id" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,
    "frameworkId" TEXT NOT NULL,
    "overallComplianceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'NOT_ASSESSED',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceRequirementAssessment" (
    "id" TEXT NOT NULL,
    "complianceAssessmentId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'NOT_ASSESSED',
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "evidenceStatus" "EvidenceStatus" NOT NULL DEFAULT 'EVIDENCE_MISSING',
    "summary" TEXT,
    "gapDescription" TEXT,
    "recommendation" TEXT,
    "priority" "Priority",
    "owner" TEXT,
    "dueDate" TIMESTAMP(3),

    CONSTRAINT "ComplianceRequirementAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuditAnswer_auditId_questionId_key" ON "AuditAnswer"("auditId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceFramework_code_key" ON "ComplianceFramework"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceRequirement_code_key" ON "ComplianceRequirement"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AuditQuestionComplianceMapping_questionId_requirementId_key" ON "AuditQuestionComplianceMapping"("questionId", "requirementId");

-- CreateIndex
CREATE UNIQUE INDEX "FindingComplianceMapping_findingId_requirementId_key" ON "FindingComplianceMapping"("findingId", "requirementId");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceRequirementAssessment_complianceAssessmentId_requ_key" ON "ComplianceRequirementAssessment"("complianceAssessmentId", "requirementId");

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditSection" ADD CONSTRAINT "AuditSection_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditQuestion" ADD CONSTRAINT "AuditQuestion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "AuditSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAnswer" ADD CONSTRAINT "AuditAnswer_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAnswer" ADD CONSTRAINT "AuditAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AuditQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AuditQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapItem" ADD CONSTRAINT "RoadmapItem_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AuditQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "ComplianceRequirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditReport" ADD CONSTRAINT "AuditReport_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditReport" ADD CONSTRAINT "AuditReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRequirement" ADD CONSTRAINT "ComplianceRequirement_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "ComplianceFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditQuestionComplianceMapping" ADD CONSTRAINT "AuditQuestionComplianceMapping_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AuditQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditQuestionComplianceMapping" ADD CONSTRAINT "AuditQuestionComplianceMapping_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "ComplianceRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindingComplianceMapping" ADD CONSTRAINT "FindingComplianceMapping_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FindingComplianceMapping" ADD CONSTRAINT "FindingComplianceMapping_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "ComplianceRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceAssessment" ADD CONSTRAINT "ComplianceAssessment_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceAssessment" ADD CONSTRAINT "ComplianceAssessment_frameworkId_fkey" FOREIGN KEY ("frameworkId") REFERENCES "ComplianceFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRequirementAssessment" ADD CONSTRAINT "ComplianceRequirementAssessment_complianceAssessmentId_fkey" FOREIGN KEY ("complianceAssessmentId") REFERENCES "ComplianceAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRequirementAssessment" ADD CONSTRAINT "ComplianceRequirementAssessment_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "ComplianceRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
