import { notFound } from "next/navigation";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AuditTabs } from "@/components/audit-tabs";
import { Card, ProgressBar, StatCard, Badge } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { generateNis2Assessment } from "@/services/ai-ready";

export default async function Nis2Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await prisma.audit.findUnique({ where: { id }, include: { organization: true, findings: { include: { question: true } }, roadmapItems: { where: { isNis2: true } } } });
  if (!audit) notFound();
  const nis2 = await generateNis2Assessment(id);
  return (
    <AppShell>
      <PageHeader title="NIS2 gap analýza" description={`${audit.organization.name} - readiness vůči NIS2 a českému zákonu o kybernetické bezpečnosti.`} />
      <AuditTabs auditId={id} />
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="NIS2 readiness" value={`${nis2.overallScore} %`} tone="blue" />
        <StatCard label="Status" value={nis2.status.replaceAll("_", " ")} tone="yellow" />
        <StatCard label="Splněné" value={nis2.counts.compliant} tone="green" />
        <StatCard label="Částečné" value={nis2.counts.partial + nis2.counts.mostly} tone="yellow" />
        <StatCard label="Nesplněné" value={nis2.counts.nonCompliant} tone="red" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Skóre podle NIS2 oblastí</h2>
          <div className="space-y-3">
            {nis2.categories.map((category) => (
              <div key={category.category}>
                <div className="mb-1 flex justify-between text-sm"><span>{category.category}</span><span>{category.score} %</span></div>
                <ProgressBar value={category.score} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Top NIS2 gaps</h2>
          <div className="space-y-3">
            {nis2.topGaps.map((gap) => (
              <div key={gap.requirement.id} className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
                <div className="font-medium">{gap.requirement.code} - {gap.requirement.title}</div>
                <div className="mt-1 text-slate-600 dark:text-slate-400">{gap.gapDescription}</div>
                <div className="mt-2 flex gap-2"><Badge tone="yellow">{gap.status.replaceAll("_", " ")}</Badge><Badge tone="blue">{gap.priority}</Badge></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-6">
        <h2 className="mb-3 font-semibold">Tabulka NIS2 požadavků</h2>
        <div className="overflow-x-auto">
          <table>
            <thead><tr><th>NIS2 kód</th><th>Oblast</th><th>Článek</th><th>Požadavek</th><th>Stav</th><th>Skóre</th><th>Důkaz</th><th>Gap</th><th>Doporučení</th><th>Priorita</th></tr></thead>
            <tbody>
              {nis2.requirements.map((row) => (
                <tr key={row.requirement.id}>
                  <td>{row.requirement.code}</td>
                  <td>{row.requirement.category}</td>
                  <td>{row.requirement.article}</td>
                  <td>{row.requirement.title}</td>
                  <td>{row.status.replaceAll("_", " ")}</td>
                  <td>{row.score} %</td>
                  <td>{row.evidenceStatus.replaceAll("_", " ")}</td>
                  <td>{row.gapDescription}</td>
                  <td>{row.recommendation}</td>
                  <td>{row.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="mt-6">
        <h2 className="mb-3 font-semibold">NIS2 disclaimer</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Tento report představuje technické a organizační posouzení připravenosti na NIS2 a nový zákon o kybernetické bezpečnosti. Nenahrazuje právní stanovisko ani formální rozhodnutí příslušného orgánu. Posouzení působnosti a konkrétních právních povinností musí být ověřeno podle aktuální legislativy a metodiky NÚKIB.
        </p>
      </Card>
    </AppShell>
  );
}
