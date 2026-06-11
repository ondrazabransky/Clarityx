import type { AnswerValue, Audit, AuditAnswer, AuditQuestion, AuditSection, Finding, Priority, Severity } from "@prisma/client";
import { answerScore } from "@/lib/audit-template";

export function getAnswerBaseScore(answer: AnswerValue): number | null {
  return answerScore[answer] ?? null;
}

export function getMaturityLevel(score: number) {
  if (score <= 20) return "Level 0 - Neřízené IT";
  if (score <= 40) return "Level 1 - Základní reaktivní IT";
  if (score <= 60) return "Level 2 - Částečně řízené IT";
  if (score <= 75) return "Level 3 - Standardizované IT";
  if (score <= 90) return "Level 4 - Řízené a měřené IT";
  return "Level 5 - Optimalizované a bezpečné IT";
}

export function getSeverityFromRisk(riskScore: number): Severity {
  if (riskScore >= 17) return "CRITICAL";
  if (riskScore >= 10) return "HIGH";
  if (riskScore >= 5) return "MEDIUM";
  return "LOW";
}

export function getPriorityFromSeverity(severity: Severity): Priority {
  if (severity === "CRITICAL") return "P1";
  if (severity === "HIGH") return "P2";
  if (severity === "MEDIUM") return "P3";
  return "P4";
}

export function calculateSectionScores(
  sections: Array<AuditSection & { questions: Array<AuditQuestion & { answers: AuditAnswer[] }> }>
) {
  return sections.map((section) => {
    let earned = 0;
    let possible = 0;
    let answered = 0;
    let evidenceMissing = 0;
    for (const question of section.questions) {
      const answer = question.answers[0];
      if (!answer) continue;
      const base = getAnswerBaseScore(answer.answer);
      if (base === null) continue;
      earned += base * question.weight;
      possible += 100 * question.weight;
      answered += 1;
      if ((question.evidenceRequired || question.nis2EvidenceRequired) && !answer.evidenceUrl) evidenceMissing += 1;
    }
    return {
      id: section.id,
      title: section.title,
      weight: section.weight,
      score: possible ? Math.round((earned / possible) * 100) : 0,
      answered,
      total: section.questions.length,
      evidenceMissing
    };
  });
}

export function calculateAuditScores(
  sections: Array<AuditSection & { questions: Array<AuditQuestion & { answers: AuditAnswer[] }> }>
) {
  const sectionScores = calculateSectionScores(sections);
  const weightedTotal = sectionScores.reduce((sum, section) => sum + section.score * section.weight, 0);
  const weightTotal = sectionScores.reduce((sum, section) => sum + section.weight, 0) || 1;
  const overallScore = Math.round(weightedTotal / weightTotal);
  const cyberSectionNames = ["Identity", "Endpoint", "Server", "Síťová", "Cloud", "Zálohování", "Disaster", "Monitoring", "Vulnerability", "Incident", "Aplikační", "Data protection", "Security awareness", "Dodavatelé"];
  const cyberSections = sectionScores.filter((section) => cyberSectionNames.some((name) => section.title.includes(name)));
  const cyberScore = cyberSections.length
    ? Math.round(cyberSections.reduce((sum, section) => sum + section.score * section.weight, 0) / cyberSections.reduce((sum, section) => sum + section.weight, 0))
    : overallScore;
  return {
    sectionScores,
    overallScore,
    itScore: overallScore,
    cybersecurityScore: cyberScore,
    maturityLevel: getMaturityLevel(overallScore),
    completion: Math.round((sectionScores.reduce((sum, s) => sum + s.answered, 0) / Math.max(1, sectionScores.reduce((sum, s) => sum + s.total, 0))) * 100),
    unanswered: sectionScores.reduce((sum, s) => sum + (s.total - s.answered), 0),
    evidenceMissing: sectionScores.reduce((sum, s) => sum + s.evidenceMissing, 0)
  };
}

export function buildFindingFromQuestion(auditId: string, question: AuditQuestion, answer: AnswerValue) {
  const critical = question.weight >= 5 || question.nis2GapImpact === "BLOCKS_COMPLIANCE";
  const likelihood = answer === "UNKNOWN" ? 3 : answer === "MOSTLY_NO" ? 3 : 4;
  const impact = critical ? 5 : question.weight >= 4 ? 4 : 3;
  const riskScore = likelihood * impact;
  const severity = getSeverityFromRisk(riskScore);
  const title = question.nis2Relevant
    ? `NIS2 gap: ${question.question.replace(/\?$/, "")}`
    : `${question.question.replace(/\?$/, "")} - nedostatečně pokryto`;
  return {
    auditId,
    questionId: question.id,
    title,
    description: answer === "UNKNOWN" ? "Kontrola nebyla ověřena a chybí dostatečný důkaz." : question.riskIfMissing ?? "Kontrola není dostatečně zavedena.",
    severity,
    likelihood,
    impact,
    riskScore,
    recommendation: question.nis2Recommendation ?? question.recommendationTemplate ?? "Doplnit kontrolu, určit vlastníka, termín a důkaz implementace.",
    priority: getPriorityFromSeverity(severity),
    dueDate: new Date(Date.now() + (severity === "CRITICAL" ? 30 : severity === "HIGH" ? 90 : severity === "MEDIUM" ? 180 : 365) * 24 * 60 * 60 * 1000)
  };
}

export function summarizeFindings(findings: Finding[]) {
  return {
    critical: findings.filter((f) => f.severity === "CRITICAL").length,
    high: findings.filter((f) => f.severity === "HIGH").length,
    medium: findings.filter((f) => f.severity === "MEDIUM").length,
    low: findings.filter((f) => f.severity === "LOW").length
  };
}

export type AuditWithRelations = Audit & {
  organization: { name: string };
  sections: Array<AuditSection & { questions: Array<AuditQuestion & { answers: AuditAnswer[] }> }>;
  findings: Finding[];
};
