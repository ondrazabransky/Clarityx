import type { AuditAnswer, AuditQuestion, AuditSection, ComplianceRequirement, Evidence, Priority } from "@prisma/client";
import { getAnswerBaseScore } from "@/services/scoring";

export function getComplianceStatus(score: number, hasAnswers: boolean) {
  if (!hasAnswers) return "NOT_ASSESSED" as const;
  if (score >= 90) return "COMPLIANT" as const;
  if (score >= 75) return "MOSTLY_COMPLIANT" as const;
  if (score >= 50) return "PARTIALLY_COMPLIANT" as const;
  return "NON_COMPLIANT" as const;
}

export function getEvidenceStatus(evidences: Evidence[], requiresEvidence: boolean) {
  if (!requiresEvidence) return "EVIDENCE_NOT_REQUIRED" as const;
  if (evidences.some((e) => e.evidenceQuality === "STRONG")) return "EVIDENCE_COMPLETE" as const;
  if (evidences.some((e) => e.evidenceQuality === "MEDIUM" || e.evidenceQuality === "WEAK")) return "EVIDENCE_PARTIAL" as const;
  return "EVIDENCE_MISSING" as const;
}

export function priorityForComplianceScore(score: number): Priority {
  if (score < 50) return "P1";
  if (score < 75) return "P2";
  if (score < 90) return "P3";
  return "P4";
}

export function calculateNis2Assessment(args: {
  requirements: ComplianceRequirement[];
  sections: Array<AuditSection & { questions: Array<AuditQuestion & { answers: AuditAnswer[] }> }>;
  evidences: Evidence[];
}) {
  const questions = args.sections.flatMap((section) => section.questions.map((question) => ({ ...question, sectionTitle: section.title })));
  const requirementRows = args.requirements.map((requirement) => {
    const linked = questions.filter((question) => question.nis2RequirementCode === requirement.code);
    let earned = 0;
    let possible = 0;
    let hasAnswers = false;
    for (const question of linked) {
      const answer = question.answers[0];
      if (!answer) continue;
      const base = getAnswerBaseScore(answer.answer);
      if (base === null) continue;
      hasAnswers = true;
      earned += base * question.weight;
      possible += 100 * question.weight;
    }
    const score = possible ? Math.round((earned / possible) * 100) : 0;
    const evidenceStatus = getEvidenceStatus(
      args.evidences.filter((e) => e.requirementId === requirement.id),
      linked.some((q) => q.nis2EvidenceRequired)
    );
    const status = getComplianceStatus(score, hasAnswers);
    return {
      requirement,
      linkedQuestions: linked,
      score,
      status,
      evidenceStatus,
      gapDescription: status === "COMPLIANT" ? "Požadavek je splněn." : `Požadavek ${requirement.code} není dostatečně pokryt nebo chybí důkaz.`,
      recommendation: Array.isArray(requirement.recommendedActions) ? (requirement.recommendedActions as string[]).join(" ") : "Doplnit opatření a doložit důkazy.",
      priority: priorityForComplianceScore(score)
    };
  });
  const categoryMap = new Map<string, { score: number; weight: number; count: number }>();
  for (const row of requirementRows) {
    const current = categoryMap.get(row.requirement.category) ?? { score: 0, weight: 0, count: 0 };
    current.score += row.score * row.requirement.weight;
    current.weight += row.requirement.weight;
    current.count += 1;
    categoryMap.set(row.requirement.category, current);
  }
  const categories = Array.from(categoryMap.entries()).map(([category, value]) => ({
    category,
    score: value.weight ? Math.round(value.score / value.weight) : 0,
    count: value.count
  }));
  const overall = categories.length ? Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length) : 0;
  return {
    overallScore: overall,
    status: getComplianceStatus(overall, requirementRows.some((r) => r.status !== "NOT_ASSESSED")),
    categories,
    requirements: requirementRows,
    counts: {
      compliant: requirementRows.filter((r) => r.status === "COMPLIANT").length,
      mostly: requirementRows.filter((r) => r.status === "MOSTLY_COMPLIANT").length,
      partial: requirementRows.filter((r) => r.status === "PARTIALLY_COMPLIANT").length,
      nonCompliant: requirementRows.filter((r) => r.status === "NON_COMPLIANT").length,
      missingEvidence: requirementRows.filter((r) => r.evidenceStatus === "EVIDENCE_MISSING").length
    },
    topGaps: requirementRows.filter((r) => r.status !== "COMPLIANT").sort((a, b) => a.score - b.score).slice(0, 10)
  };
}

export function assessNis2Applicability(input: {
  sector?: string | null;
  employeeCount?: number | null;
  revenueRange?: string | null;
  criticalService?: string | null;
}) {
  const regulatedSector = /energet|doprav|zdrav|voda|odpad|potrav|výrob|finance|cloud|hosting|dns|datacent|it|bezpe/i.test(
    `${input.sector ?? ""} ${input.criticalService ?? ""}`
  );
  const largeEnough = (input.employeeCount ?? 0) >= 50 || /10|50|mil|mld|>/.test(input.revenueRange ?? "");
  if (regulatedSector && largeEnough) return "pravděpodobně v působnosti";
  if (regulatedSector || largeEnough) return "možná v působnosti";
  return "pravděpodobně mimo působnost, nutné právní posouzení";
}
