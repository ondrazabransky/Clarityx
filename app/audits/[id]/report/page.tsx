import { notFound } from "next/navigation";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AuditTabs } from "@/components/audit-tabs";
import { Card } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { generateExecutiveSummary, generateNis2Assessment } from "@/services/ai-ready";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await prisma.audit.findUnique({ where: { id }, include: { organization: true } });
  if (!audit) notFound();
  const [summary, nis2] = await Promise.all([generateExecutiveSummary(id), generateNis2Assessment(id)]);
  return (
    <AppShell>
      <PageHeader title="Reporty a exporty" description="Manažerský report, technický report, NIS2 readiness report a datové exporty." />
      <AuditTabs auditId={id} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="mb-3 font-semibold">Manažerský report</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{summary}</p>
          <a className="mt-4 inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm text-white" href={`/api/audits/${id}/export?format=pdf&type=executive`}>Export PDF</a>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Technický report</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Detailní skóre podle oblastí, všechny odpovědi, nálezy, evidence, doporučení, vazba na rámce a roadmapa.</p>
          <a className="mt-4 inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm text-white" href={`/api/audits/${id}/export?format=pdf&type=technical`}>Export PDF</a>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">NIS2 Readiness Report</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">NIS2 readiness skóre {nis2.overallScore} %, gap analýza, kritické mezery, odpovědnost vedení a technická příloha.</p>
          <a className="mt-4 inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm text-white" href={`/api/audits/${id}/export?format=pdf&type=nis2`}>Export PDF</a>
        </Card>
      </div>
      <Card className="mt-6">
        <h2 className="mb-3 font-semibold">Datové exporty</h2>
        <div className="flex flex-wrap gap-2">
          <a className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900" href={`/api/audits/${id}/export?format=xlsx`}>XLSX</a>
          <a className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900" href={`/api/audits/${id}/export?format=json`}>JSON</a>
        </div>
      </Card>
    </AppShell>
  );
}
