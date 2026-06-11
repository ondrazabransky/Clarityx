import { notFound } from "next/navigation";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AuditTabs } from "@/components/audit-tabs";
import { Badge, Card } from "@/components/ui";
import { answerLabels } from "@/lib/audit-template";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function QuestionnairePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await prisma.audit.findUnique({ where: { id }, include: { organization: true, sections: { orderBy: { order: "asc" }, include: { questions: { orderBy: { order: "asc" }, include: { answers: { where: { auditId: id } } } } } } } });
  if (!audit) notFound();
  return (
    <AppShell>
      <PageHeader title="Auditní dotazník" description="Odpovědi se skórují podle váhy otázky. Ne, Spíše ne a Nevím automaticky nabízejí nález." />
      <AuditTabs auditId={id} />
      <div className="space-y-6">
        {audit.sections.map((section) => (
          <Card key={section.id}>
            <h2 className="font-semibold">{section.order}. {section.title}</h2>
            <div className="mt-4 overflow-x-auto">
              <table>
                <thead><tr><th>Kód</th><th>Otázka</th><th>Váha</th><th>Odpověď</th><th>NIS2</th><th>Důkaz</th></tr></thead>
                <tbody>
                  {section.questions.map((question) => {
                    const answer = question.answers[0];
                    return (
                      <tr key={question.id}>
                        <td>{question.code}</td>
                        <td>{question.question}</td>
                        <td>{question.weight}</td>
                        <td>
                          <form action={`/api/audits/${id}/answers`} method="post" className="flex gap-2">
                            <input type="hidden" name="questionId" value={question.id} />
                            <select name="answer" defaultValue={answer?.answer ?? "UNKNOWN"}>
                              {Object.entries(answerLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                            <button className="rounded-md bg-slate-900 px-3 py-2 text-xs text-white dark:bg-slate-100 dark:text-slate-900">Uložit</button>
                          </form>
                        </td>
                        <td>{question.nis2Relevant ? <Badge tone="blue">{question.nis2RequirementCode}</Badge> : null}</td>
                        <td>{question.evidenceRequired || question.nis2EvidenceRequired ? (answer?.evidenceUrl ? "doloženo" : "chybí") : "nepovinný"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
