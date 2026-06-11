import type { AuditType, UserRole } from "@prisma/client";
import { auditSections } from "@/lib/audit-template";
import { prisma } from "@/lib/prisma";

export function auditTemplateCreateData(organizationId: string, title: string, auditType: AuditType, createdById: string) {
  return {
    organizationId,
    title,
    auditType,
    status: "DRAFT" as const,
    createdById,
    sections: {
      create: auditSections.map((section, sectionIndex) => ({
        title: section.title,
        description: section.description,
        order: sectionIndex + 1,
        weight: section.weight,
        questions: {
          create: section.questions.map((question, questionIndex) => ({
            code: `${section.code}-${String(questionIndex + 1).padStart(3, "0")}`,
            question: question.text,
            category: section.title,
            framework: question.nis2 ? "NIS2" : "Internal IT Standard",
            controlReference: question.nis2?.code,
            weight: question.weight ?? 3,
            maturityLevel: Math.min(5, Math.max(1, Math.ceil((question.weight ?? 3) / 1))),
            evidenceRequired: question.evidenceRequired ?? false,
            recommendationTemplate: question.recommendation,
            riskIfMissing: question.risk,
            order: questionIndex + 1,
            nis2Relevant: Boolean(question.nis2),
            nis2RequirementCode: question.nis2?.code,
            nis2Article: question.nis2?.article,
            nis2Category: question.nis2?.category,
            nis2MappingStrength: question.nis2?.strength,
            nis2EvidenceRequired: Boolean(question.nis2),
            nis2GapImpact: question.nis2?.impact,
            nis2Recommendation: question.nis2?.recommendation
          }))
        }
      }))
    }
  };
}

export async function createAuditFromTemplate(args: {
  organizationId: string;
  title: string;
  auditType: AuditType;
  createdById: string;
  actorRole?: UserRole | string;
}) {
  const audit = await prisma.audit.create({
    data: auditTemplateCreateData(args.organizationId, args.title, args.auditType, args.createdById)
  });
  await prisma.auditLog.create({
    data: {
      userId: args.createdById,
      action: args.actorRole === "VIEWER" ? "create_self_service_audit" : "create_audit",
      entityType: "Audit",
      entityId: audit.id,
      newValue: { title: args.title, auditType: args.auditType }
    }
  });
  return audit;
}
