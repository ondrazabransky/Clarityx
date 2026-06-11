import { prisma } from "@/lib/prisma";
import { calculateAuditScores, buildFindingFromQuestion } from "@/services/scoring";
import { calculateNis2Assessment } from "@/services/compliance";

export async function generateExecutiveSummary(auditId: string) {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: { organization: true, findings: true, sections: { include: { questions: { include: { answers: { where: { auditId } } } } } } }
  });
  if (!audit) throw new Error("Audit neexistuje.");
  const scores = calculateAuditScores(audit.sections);
  const topFindings = audit.findings.sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  return `${audit.organization.name} dosahuje celkového IT maturity skóre ${scores.overallScore} % (${scores.maturityLevel}). Nejvýznamnější rizika jsou: ${topFindings.map((f) => f.title).join(", ") || "zatím bez nálezů"}. Prioritou je stabilizace kritických bezpečnostních kontrol, doplnění důkazů a řízená roadmapa opatření.`;
}

export async function generateFindingsFromAnswers(auditId: string) {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: { sections: { include: { questions: { include: { answers: { where: { auditId } } } } } } }
  });
  if (!audit) throw new Error("Audit neexistuje.");
  const created = [];
  for (const question of audit.sections.flatMap((s) => s.questions)) {
    const answer = question.answers[0]?.answer;
    if (!answer || !["NO", "MOSTLY_NO", "UNKNOWN"].includes(answer)) continue;
    const exists = await prisma.finding.findFirst({ where: { auditId, questionId: question.id } });
    if (exists) continue;
    created.push(await prisma.finding.create({ data: buildFindingFromQuestion(auditId, question, answer) }));
  }
  return created;
}

export async function generateRoadmap(auditId: string) {
  const findings = await prisma.finding.findMany({ where: { auditId }, orderBy: [{ riskScore: "desc" }] });
  const existing = await prisma.roadmapItem.findMany({ where: { auditId } });
  const existingTitles = new Set(existing.map((item) => item.title));
  const created = [];
  for (const finding of findings) {
    if (existingTitles.has(finding.title)) continue;
    const quarter = finding.priority === "P1" ? "0-30 dní" : finding.priority === "P2" ? "31-90 dní" : finding.priority === "P3" ? "91-180 dní" : "181-365 dní";
    created.push(await prisma.roadmapItem.create({
      data: {
        auditId,
        title: finding.title,
        description: finding.recommendation,
        priority: finding.priority,
        quarter,
        owner: finding.owner,
        dueDate: finding.dueDate,
        isNis2: finding.title.includes("NIS2")
      }
    }));
  }
  return created;
}

export async function generateTechnicalReport(auditId: string) {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: { organization: true, findings: true, recommendations: true, roadmapItems: true, evidences: true, sections: { include: { questions: { include: { answers: { where: { auditId } } } } } } }
  });
  if (!audit) throw new Error("Audit neexistuje.");
  const scores = calculateAuditScores(audit.sections);
  return { audit, scores, generatedAt: new Date().toISOString() };
}

export async function compareAudits(auditId1: string, auditId2: string) {
  const audits = await prisma.audit.findMany({
    where: { id: { in: [auditId1, auditId2] } },
    include: { sections: { include: { questions: { include: { answers: true } } } } }
  });
  return audits.map((audit) => ({ id: audit.id, title: audit.title, scores: calculateAuditScores(audit.sections) }));
}

export async function generateNis2Assessment(auditId: string) {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    include: { evidences: true, sections: { include: { questions: { include: { answers: { where: { auditId } } } } } } }
  });
  const framework = await prisma.complianceFramework.findUnique({ where: { code: "NIS2" }, include: { requirements: true } });
  if (!audit || !framework) throw new Error("Audit nebo NIS2 framework neexistuje.");
  return calculateNis2Assessment({ requirements: framework.requirements, sections: audit.sections, evidences: audit.evidences });
}
