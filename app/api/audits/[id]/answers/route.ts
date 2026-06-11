import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { AnswerValue } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildFindingFromQuestion, calculateAuditScores, getAnswerBaseScore } from "@/services/scoring";
import { generateNis2Assessment } from "@/services/ai-ready";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const form = await request.formData();
  const questionId = String(form.get("questionId") ?? "");
  const answer = String(form.get("answer") ?? "UNKNOWN") as AnswerValue;
  const question = await prisma.auditQuestion.findUnique({ where: { id: questionId } });
  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });
  const base = getAnswerBaseScore(answer);
  const saved = await prisma.auditAnswer.upsert({
    where: { auditId_questionId: { auditId: id, questionId } },
    create: { auditId: id, questionId, answer, score: base === null ? 0 : base * question.weight, maturityScore: base ?? 0 },
    update: { answer, score: base === null ? 0 : base * question.weight, maturityScore: base ?? 0 }
  });
  if (["NO", "MOSTLY_NO", "UNKNOWN"].includes(answer)) {
    const exists = await prisma.finding.findFirst({ where: { auditId: id, questionId } });
    if (!exists) {
      const finding = await prisma.finding.create({ data: buildFindingFromQuestion(id, question, answer) });
      if (question.nis2RequirementCode) {
        const requirement = await prisma.complianceRequirement.findUnique({ where: { code: question.nis2RequirementCode } });
        if (requirement) {
          await prisma.findingComplianceMapping.create({
            data: { findingId: finding.id, requirementId: requirement.id, impactOnCompliance: question.nis2GapImpact ?? "WEAKENS_COMPLIANCE", note: question.nis2Article }
          });
        }
      }
    }
  }
  const audit = await prisma.audit.findUnique({ where: { id }, include: { sections: { include: { questions: { include: { answers: { where: { auditId: id } } } } } } } });
  if (audit) {
    const scores = calculateAuditScores(audit.sections);
    const nis2 = await generateNis2Assessment(id);
    await prisma.audit.update({ where: { id }, data: { overallScore: scores.overallScore, itScore: scores.itScore, cybersecurityScore: scores.cybersecurityScore, maturityLevel: scores.maturityLevel, nis2Score: nis2.overallScore } });
  }
  await prisma.auditLog.create({ data: { userId: session.user.id, action: "change_answer", entityType: "AuditAnswer", entityId: saved.id, newValue: { answer } } });
  return NextResponse.redirect(new URL(`/audits/${id}/questionnaire`, request.url));
}
