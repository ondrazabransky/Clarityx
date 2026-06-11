import bcrypt from "bcryptjs";
import { PrismaClient, type AnswerValue } from "@prisma/client";
import { auditSections, nis2Requirements } from "../lib/audit-template";
import { buildFindingFromQuestion, calculateAuditScores } from "../services/scoring";
import { calculateNis2Assessment } from "../services/compliance";

const prisma = new PrismaClient();

const demoAnswers: AnswerValue[] = ["YES", "MOSTLY_YES", "PARTIAL", "MOSTLY_NO", "NO", "UNKNOWN"];

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 12);
  const [admin, auditor, viewer] = await Promise.all([
    prisma.user.upsert({ where: { email: "admin@example.com" }, update: {}, create: { name: "Demo Admin", email: "admin@example.com", passwordHash, role: "ADMIN" } }),
    prisma.user.upsert({ where: { email: "auditor@example.com" }, update: {}, create: { name: "Demo Auditor", email: "auditor@example.com", passwordHash, role: "AUDITOR" } }),
    prisma.user.upsert({ where: { email: "viewer@example.com" }, update: {}, create: { name: "Demo Viewer", email: "viewer@example.com", passwordHash, role: "VIEWER" } })
  ]);

  await prisma.complianceFramework.upsert({
    where: { code: "NIS2" },
    update: {},
    create: {
      code: "NIS2",
      name: "NIS2 Directive / Czech Cybersecurity Act Mapping",
      description: "Mapování požadavků NIS2 a české implementace zákona o kybernetické bezpečnosti.",
      version: "EU Directive 2022/2555 + CZ implementation",
      country: "EU/CZ",
      validFrom: new Date("2024-10-18"),
      sourceUrl: "https://eur-lex.europa.eu/eli/dir/2022/2555/oj"
    }
  });
  const framework = await prisma.complianceFramework.findUniqueOrThrow({ where: { code: "NIS2" } });
  for (const requirement of nis2Requirements) {
    await prisma.complianceRequirement.upsert({
      where: { code: requirement.code },
      update: {
        title: requirement.title,
        description: requirement.description,
        article: requirement.article,
        category: requirement.category,
        requirementType: requirement.requirementType,
        weight: requirement.weight,
        recommendedEvidence: [...requirement.evidence],
        recommendedActions: [...requirement.actions]
      },
      create: {
        frameworkId: framework.id,
        code: requirement.code,
        title: requirement.title,
        description: requirement.description,
        article: requirement.article,
        category: requirement.category,
        requirementType: requirement.requirementType,
        weight: requirement.weight,
        recommendedEvidence: [...requirement.evidence],
        recommendedActions: [...requirement.actions]
      }
    });
  }

  const organization = await prisma.organization.upsert({
    where: { id: "demo-organization-egoe" },
    update: {},
    create: {
      id: "demo-organization-egoe",
      name: "Egoé Manufacturing Demo",
      ico: "12345678",
      industry: "Výroba a servisní organizace",
      employeeCount: 180,
      revenueRange: "250-500 mil. Kč",
      country: "CZ",
      description: "Demo výrobní firma pro kompletní IT, kyberbezpečnostní a NIS2 audit.",
      isNis2InScope: true,
      entityType: "IMPORTANT_ENTITY",
      sector: "Výroba",
      subsector: "Strojírenská výroba",
      sizeCriterion: "střední podnik",
      revenueCriterion: "nad 10 mil. EUR orientačně",
      employeeCriterion: "nad 50 zaměstnanců",
      criticalService: "Dodavatel pro regulované a průmyslové zákazníky",
      nis2Notes: "Orientačně v působnosti, nutné potvrdit právním posouzením."
    }
  });

  await prisma.audit.deleteMany({ where: { organizationId: organization.id } });
  const audit = await prisma.audit.create({
    data: {
      organizationId: organization.id,
      title: "Kompletní IT a kyberbezpečnostní audit 2026",
      auditType: "COMPLETE_IT_AUDIT",
      status: "IN_PROGRESS",
      startDate: new Date(),
      createdById: auditor.id,
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
              description: question.risk,
              category: section.title,
              framework: question.nis2 ? "NIS2" : "Interní IT standard",
              controlReference: question.nis2?.code,
              weight: question.weight ?? 3,
              maturityLevel: Math.min(5, Math.max(1, question.weight ?? 3)),
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
    },
    include: { sections: { include: { questions: true } } }
  });

  const requirementMap = new Map((await prisma.complianceRequirement.findMany()).map((r) => [r.code, r]));
  for (const question of audit.sections.flatMap((section) => section.questions)) {
    if (!question.nis2RequirementCode) continue;
    const requirement = requirementMap.get(question.nis2RequirementCode);
    if (!requirement) continue;
    await prisma.auditQuestionComplianceMapping.create({
      data: {
        questionId: question.id,
        requirementId: requirement.id,
        mappingStrength: question.nis2MappingStrength ?? "PRIMARY",
        mappingNote: question.nis2Article
      }
    });
  }

  let index = 0;
  for (const question of audit.sections.flatMap((section) => section.questions)) {
    const answer = question.weight >= 5 && question.nis2Relevant ? demoAnswers[(index + 3) % demoAnswers.length] : demoAnswers[index % demoAnswers.length];
    index += 1;
    const scoreBase = answer === "NOT_RELEVANT" ? null : answer === "YES" ? 100 : answer === "MOSTLY_YES" ? 75 : answer === "PARTIAL" ? 50 : answer === "MOSTLY_NO" ? 25 : 0;
    await prisma.auditAnswer.create({
      data: {
        auditId: audit.id,
        questionId: question.id,
        answer,
        score: scoreBase === null ? 0 : scoreBase * question.weight,
        maturityScore: scoreBase ?? 0,
        comment: answer === "YES" || answer === "MOSTLY_YES" ? "Doloženo při demo auditu." : "Vyžaduje doplnění důkazů nebo opatření.",
        evidenceUrl: question.evidenceRequired && ["YES", "MOSTLY_YES"].includes(answer) ? "/uploads/demo-evidence.pdf" : null,
        responsiblePerson: "IT Manager"
      }
    });
  }

  const fullAudit = await prisma.audit.findUniqueOrThrow({
    where: { id: audit.id },
    include: { evidences: true, sections: { include: { questions: { include: { answers: { where: { auditId: audit.id } } } } } } }
  });
  const riskyQuestions = fullAudit.sections.flatMap((section) => section.questions).filter((question) => ["NO", "MOSTLY_NO", "UNKNOWN"].includes(question.answers[0]?.answer ?? "")).slice(0, 45);
  for (const question of riskyQuestions) {
    const answer = question.answers[0]!.answer;
    const finding = await prisma.finding.create({ data: buildFindingFromQuestion(audit.id, question, answer) });
    if (question.nis2RequirementCode) {
      const requirement = requirementMap.get(question.nis2RequirementCode);
      if (requirement) {
        await prisma.findingComplianceMapping.create({
          data: {
            findingId: finding.id,
            requirementId: requirement.id,
            impactOnCompliance: question.nis2GapImpact ?? "WEAKENS_COMPLIANCE",
            note: question.nis2Article
          }
        });
      }
    }
    await prisma.recommendation.create({
      data: {
        auditId: audit.id,
        findingId: finding.id,
        title: finding.title,
        description: finding.recommendation,
        priority: finding.priority,
        effort: finding.priority === "P1" ? "2-4 týdny" : finding.priority === "P2" ? "1-3 měsíce" : "3-6 měsíců",
        costEstimate: finding.priority === "P1" ? 120000 : finding.priority === "P2" ? 80000 : 35000,
        benefit: "Snížení rizika a lepší připravenost na audit.",
        targetState: "Kontrola je zavedena, vlastník určen a důkaz uložen v auditu."
      }
    });
    const quarter = finding.priority === "P1" ? "0-30 dní" : finding.priority === "P2" ? "31-90 dní" : finding.priority === "P3" ? "91-180 dní" : "181-365 dní";
    await prisma.roadmapItem.create({
      data: {
        auditId: audit.id,
        title: finding.title,
        description: finding.recommendation,
        priority: finding.priority,
        quarter,
        owner: "IT Manager",
        dueDate: finding.dueDate,
        estimatedCost: finding.priority === "P1" ? 120000 : finding.priority === "P2" ? 80000 : 35000,
        isNis2: question.nis2Relevant
      }
    });
  }

  const evidenceRequirement = requirementMap.get("NIS2-11");
  if (evidenceRequirement) {
    await prisma.evidence.create({
      data: {
        auditId: audit.id,
        requirementId: evidenceRequirement.id,
        fileName: "mfa-export-demo.csv",
        fileUrl: "/uploads/mfa-export-demo.csv",
        description: "Demo export nastavení MFA.",
        evidenceType: "MFA export",
        evidenceQuality: "MEDIUM",
        evidenceDate: new Date(),
        evidenceOwner: "Security Manager",
        uploadedById: viewer.id
      }
    });
  }

  const refreshed = await prisma.audit.findUniqueOrThrow({
    where: { id: audit.id },
    include: { evidences: true, sections: { include: { questions: { include: { answers: { where: { auditId: audit.id } } } } } } }
  });
  const scores = calculateAuditScores(refreshed.sections);
  const nis2 = calculateNis2Assessment({ requirements: Array.from(requirementMap.values()), sections: refreshed.sections, evidences: refreshed.evidences });
  await prisma.audit.update({
    where: { id: audit.id },
    data: {
      overallScore: scores.overallScore,
      itScore: scores.itScore,
      cybersecurityScore: scores.cybersecurityScore,
      maturityLevel: scores.maturityLevel,
      nis2Score: nis2.overallScore,
      riskScore: await prisma.finding.aggregate({ where: { auditId: audit.id }, _avg: { riskScore: true } }).then((r) => r._avg.riskScore ?? 0)
    }
  });

  const complianceAssessment = await prisma.complianceAssessment.create({
    data: {
      auditId: audit.id,
      frameworkId: framework.id,
      overallComplianceScore: nis2.overallScore,
      status: nis2.status
    }
  });
  for (const row of nis2.requirements) {
    await prisma.complianceRequirementAssessment.create({
      data: {
        complianceAssessmentId: complianceAssessment.id,
        requirementId: row.requirement.id,
        status: row.status,
        score: row.score,
        evidenceStatus: row.evidenceStatus,
        summary: row.requirement.description,
        gapDescription: row.gapDescription,
        recommendation: row.recommendation,
        priority: row.priority,
        owner: "IT Manager"
      }
    });
  }

  await prisma.auditReport.createMany({
    data: [
      { auditId: audit.id, reportType: "EXECUTIVE", summary: "Manažerský report připraven v demo datech.", createdById: admin.id },
      { auditId: audit.id, reportType: "TECHNICAL", summary: "Technický report připraven v demo datech.", createdById: auditor.id },
      { auditId: audit.id, reportType: "NIS2_READINESS", summary: "NIS2 readiness report připraven v demo datech.", createdById: auditor.id }
    ]
  });

  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: "create_organization", entityType: "Organization", entityId: organization.id },
      { userId: auditor.id, action: "create_audit", entityType: "Audit", entityId: audit.id },
      { userId: auditor.id, action: "generate_report", entityType: "Audit", entityId: audit.id }
    ]
  });

  console.log(`Seed complete: ${auditSections.reduce((sum, section) => sum + section.questions.length, 0)} otázek, audit ${audit.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
