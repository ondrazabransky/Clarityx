import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import { generateExecutiveSummary, generateNis2Assessment, generateTechnicalReport } from "@/services/ai-ready";

export async function exportAuditJson(auditId: string) {
  const report = await generateTechnicalReport(auditId);
  const nis2 = await generateNis2Assessment(auditId);
  return JSON.stringify({ ...report, nis2 }, null, 2);
}

export async function exportAuditXlsx(auditId: string) {
  const { audit, scores } = await generateTechnicalReport(auditId);
  const nis2 = await generateNis2Assessment(auditId);
  const workbook = new ExcelJS.Workbook();
  const sheets = ["Summary", "Scores", "Questions", "Answers", "Findings", "Recommendations", "Roadmap", "Evidence", "NIS2"];
  for (const name of sheets) workbook.addWorksheet(name);
  workbook.getWorksheet("Summary")!.addRows([
    ["Organizace", audit.organization.name],
    ["Audit", audit.title],
    ["IT maturity score", scores.itScore],
    ["Cybersecurity maturity score", scores.cybersecurityScore],
    ["NIS2 readiness score", nis2.overallScore]
  ]);
  workbook.getWorksheet("Scores")!.addRows([["Oblast", "Skóre"], ...scores.sectionScores.map((s) => [s.title, s.score])]);
  workbook.getWorksheet("Questions")!.addRows([["Kód", "Otázka", "NIS2"], ...audit.sections.flatMap((s) => s.questions.map((q) => [q.code, q.question, q.nis2RequirementCode ?? ""]))]);
  workbook.getWorksheet("Answers")!.addRows([["Otázka", "Odpověď", "Komentář"], ...audit.sections.flatMap((s) => s.questions.flatMap((q) => q.answers.map((a) => [q.question, a.answer, a.comment ?? ""])))]);
  workbook.getWorksheet("Findings")!.addRows([["Nález", "Závažnost", "Riziko", "Doporučení"], ...audit.findings.map((f) => [f.title, f.severity, f.riskScore, f.recommendation])]);
  workbook.getWorksheet("Recommendations")!.addRows([["Název", "Priorita", "Popis"], ...audit.recommendations.map((r) => [r.title, r.priority, r.description])]);
  workbook.getWorksheet("Roadmap")!.addRows([["Název", "Priorita", "Období", "Stav"], ...audit.roadmapItems.map((r) => [r.title, r.priority, r.quarter, r.status])]);
  workbook.getWorksheet("Evidence")!.addRows([["Soubor", "Typ", "Kvalita"], ...audit.evidences.map((e) => [e.fileName, e.evidenceType ?? "", e.evidenceQuality])]);
  workbook.getWorksheet("NIS2")!.addRows([["Kód", "Oblast", "Článek", "Stav", "Skóre", "Důkaz", "Gap"], ...nis2.requirements.map((r) => [r.requirement.code, r.requirement.category, r.requirement.article, r.status, r.score, r.evidenceStatus, r.gapDescription])]);
  return workbook.xlsx.writeBuffer();
}

export async function exportAuditPdf(auditId: string, reportType: "executive" | "technical" | "nis2" = "executive") {
  const { audit, scores } = await generateTechnicalReport(auditId);
  const summary = await generateExecutiveSummary(auditId);
  const nis2 = await generateNis2Assessment(auditId);
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(reportType === "nis2" ? "NIS2 Readiness Report" : reportType === "technical" ? "Technický auditní report" : "Manažerský auditní report", 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lines = [
    `Organizace: ${audit.organization.name}`,
    `Audit: ${audit.title}`,
    `IT maturity score: ${scores.itScore} %`,
    `Cybersecurity maturity score: ${scores.cybersecurityScore} %`,
    `NIS2 readiness score: ${nis2.overallScore} % (${nis2.status})`,
    "",
    "Manažerské shrnutí:",
    summary,
    "",
    "Top rizika:",
    ...audit.findings.sort((a, b) => b.riskScore - a.riskScore).slice(0, 10).map((f) => `- ${f.title} (${f.severity}, ${f.priority})`)
  ];
  const disclaimer = "Tento report představuje technické a organizační posouzení připravenosti na NIS2 a nový zákon o kybernetické bezpečnosti. Nenahrazuje právní stanovisko ani formální rozhodnutí příslušného orgánu. Posouzení působnosti a konkrétních právních povinností musí být ověřeno podle aktuální legislativy a metodiky NÚKIB.";
  const wrapped = doc.splitTextToSize(reportType === "nis2" ? [...lines, "", "Disclaimer:", disclaimer].join("\n") : lines.join("\n"), 180);
  doc.text(wrapped, 14, 30);
  return Buffer.from(doc.output("arraybuffer"));
}
