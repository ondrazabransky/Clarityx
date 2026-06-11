import { notFound } from "next/navigation";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AuditTabs } from "@/components/audit-tabs";
import { RiskBar, SectionRadar } from "@/components/charts";
import { Badge, Card, ProgressBar, StatCard, severityTone } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { calculateAuditScores, summarizeFindings } from "@/services/scoring";
import { generateNis2Assessment } from "@/services/ai-ready";

export const dynamic = "force-dynamic";

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await prisma.audit.findUnique({
    where: { id },
    include: {
      organization: true,
      findings: true,
      roadmapItems: true,
      sections: { orderBy: { order: "asc" }, include: { questions: { orderBy: { order: "asc" }, include: { answers: { where: { auditId: id } } } } } }
    }
  });
  if (!audit) notFound();
  const scores = calculateAuditScores(audit.sections);
  const nis2 = await generateNis2Assessment(id);
  const findingStats = summarizeFindings(audit.findings);
  return (
    <AppShell>
      <PageHeader title={audit.title} description={`${audit.organization.name} - ${audit.status.replaceAll("_", " ")}`} />
      <AuditTabs auditId={audit.id} />
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="IT maturity" value={`${scores.itScore} %`} tone="blue" />
        <StatCard label="Cybersecurity" value={`${scores.cybersecurityScore} %`} tone="blue" />
        <StatCard label="NIS2 readiness" value={`${nis2.overallScore} %`} tone="yellow" />
        <StatCard label="Critical" value={findingStats.critical} tone="red" />
        <StatCard label="High" value={findingStats.high} tone="orange" />
        <StatCard label="Vyplněno" value={`${scores.completion} %`} tone="green" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Skóre podle oblastí</h2>
          <SectionRadar data={scores.sectionScores} />
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Top rizika</h2>
          <RiskBar data={audit.findings.slice().sort((a, b) => b.riskScore - a.riskScore).slice(0, 8)} />
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-3 font-semibold">Nejhorší oblasti</h2>
          <div className="space-y-3">
            {scores.sectionScores.slice().sort((a, b) => a.score - b.score).slice(0, 6).map((section) => (
              <div key={section.id}>
                <div className="mb-1 flex justify-between text-sm"><span>{section.title}</span><span>{section.score} %</span></div>
                <ProgressBar value={section.score} />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Prioritní opatření</h2>
          <div className="space-y-3">
            {audit.roadmapItems.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
                <div className="font-medium">{item.title}</div>
                <div className="mt-1 flex gap-2"><Badge tone="blue">{item.priority}</Badge><Badge>{item.quarter}</Badge></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-6">
        <h2 className="mb-3 font-semibold">Stav nálezů</h2>
        <table>
          <thead><tr><th>Nález</th><th>Závažnost</th><th>Priorita</th><th>Stav</th><th>Skóre</th></tr></thead>
          <tbody>
            {audit.findings.slice(0, 10).map((finding) => (
              <tr key={finding.id}>
                <td><a className="text-blue-600" href={`/audits/${audit.id}/findings/${finding.id}`}>{finding.title}</a></td>
                <td><Badge tone={severityTone(finding.severity)}>{finding.severity}</Badge></td>
                <td>{finding.priority}</td>
                <td>{finding.status}</td>
                <td>{finding.riskScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
