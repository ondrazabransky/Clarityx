import { notFound } from "next/navigation";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AuditTabs } from "@/components/audit-tabs";
import { Badge, Card, severityTone } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FindingDetailPage({ params }: { params: Promise<{ id: string; findingId: string }> }) {
  const { id, findingId } = await params;
  const finding = await prisma.finding.findUnique({ where: { id: findingId }, include: { audit: true, question: true, complianceMappings: { include: { requirement: true } } } });
  if (!finding) notFound();
  return (
    <AppShell>
      <PageHeader title={finding.title} description="Detail nálezu, rizika a doporučeného opatření." />
      <AuditTabs auditId={id} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-3 font-semibold">Popis problému</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">{finding.description}</p>
          <h2 className="mb-3 mt-6 font-semibold">Doporučení</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300">{finding.recommendation}</p>
        </Card>
        <Card>
          <dl className="grid gap-3 text-sm">
            <div><dt className="text-slate-500">Závažnost</dt><dd><Badge tone={severityTone(finding.severity)}>{finding.severity}</Badge></dd></div>
            <div><dt className="text-slate-500">Pravděpodobnost</dt><dd>{finding.likelihood}</dd></div>
            <div><dt className="text-slate-500">Dopad</dt><dd>{finding.impact}</dd></div>
            <div><dt className="text-slate-500">Risk score</dt><dd>{finding.riskScore}</dd></div>
            <div><dt className="text-slate-500">Priorita</dt><dd>{finding.priority}</dd></div>
            <div><dt className="text-slate-500">Stav</dt><dd>{finding.status}</dd></div>
            <div><dt className="text-slate-500">Otázka</dt><dd>{finding.question?.question ?? "bez vazby"}</dd></div>
          </dl>
        </Card>
      </div>
    </AppShell>
  );
}
