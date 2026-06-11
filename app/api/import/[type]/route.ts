import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { AnswerValue } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/utils/csv";
import { getAnswerBaseScore } from "@/services/scoring";

export async function POST(request: Request, { params }: { params: Promise<{ type: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "AUDITOR"].includes(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { type } = await params;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "CSV soubor chybí." }, { status: 400 });
  const rows = parseCsv(await file.text());

  if (type === "organizations") {
    const created = [];
    for (const row of rows) {
      created.push(await prisma.organization.create({
        data: {
          name: row.name,
          ico: row.ico,
          industry: row.industry,
          employeeCount: row.employeeCount ? Number(row.employeeCount) : null,
          revenueRange: row.revenueRange,
          country: row.country || "CZ",
          description: row.description
        }
      }));
    }
    return NextResponse.json({ imported: created.length });
  }

  if (type === "questions") {
    const sectionId = String(form.get("sectionId") ?? "");
    const created = [];
    for (const [index, row] of rows.entries()) {
      created.push(await prisma.auditQuestion.create({
        data: {
          sectionId,
          code: row.code,
          question: row.question,
          description: row.description,
          category: row.category,
          framework: row.framework,
          controlReference: row.controlReference,
          weight: Number(row.weight || 3),
          maturityLevel: Number(row.maturityLevel || 1),
          evidenceRequired: row.evidenceRequired === "true",
          recommendationTemplate: row.recommendationTemplate,
          riskIfMissing: row.riskIfMissing,
          order: Number(row.order || index + 1),
          nis2Relevant: row.nis2Relevant === "true",
          nis2RequirementCode: row.nis2RequirementCode || null,
          nis2Article: row.nis2Article || null,
          nis2Category: row.nis2Category || null,
          nis2EvidenceRequired: row.nis2EvidenceRequired === "true",
          nis2Recommendation: row.nis2Recommendation || null
        }
      }));
    }
    return NextResponse.json({ imported: created.length });
  }

  if (type === "answers") {
    const auditId = String(form.get("auditId") ?? "");
    const imported = [];
    for (const row of rows) {
      const question = await prisma.auditQuestion.findFirst({ where: { OR: [{ id: row.questionId }, { code: row.questionCode }] } });
      if (!question) continue;
      const answer = (row.answer || "UNKNOWN") as AnswerValue;
      const base = getAnswerBaseScore(answer);
      imported.push(await prisma.auditAnswer.upsert({
        where: { auditId_questionId: { auditId, questionId: question.id } },
        create: { auditId, questionId: question.id, answer, score: base === null ? 0 : base * question.weight, maturityScore: base ?? 0, comment: row.comment },
        update: { answer, score: base === null ? 0 : base * question.weight, maturityScore: base ?? 0, comment: row.comment }
      }));
    }
    return NextResponse.json({ imported: imported.length });
  }

  return NextResponse.json({ error: "Neznámý typ importu." }, { status: 404 });
}
