import { notFound } from "next/navigation";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge, Card, StatCard } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { assessNis2Applicability } from "@/services/compliance";

export const dynamic = "force-dynamic";

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const organization = await prisma.organization.findUnique({ where: { id }, include: { audits: true } });
  if (!organization) notFound();
  const applicability = assessNis2Applicability(organization);
  return (
    <AppShell>
      <PageHeader title={organization.name} description={organization.description ?? "Detail organizace a NIS2 applicability."} />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Zaměstnanci" value={organization.employeeCount ?? "neuvedeno"} />
        <StatCard label="Audity" value={organization.audits.length} tone="blue" />
        <StatCard label="NIS2 scope" value={organization.isNis2InScope ? "Ano" : "Ručně neurčeno"} tone={organization.isNis2InScope ? "green" : "yellow"} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">NIS2 applicability</h2>
          <dl className="grid gap-3 text-sm">
            <div><dt className="text-slate-500">Typ subjektu</dt><dd><Badge tone="blue">{organization.entityType.replaceAll("_", " ")}</Badge></dd></div>
            <div><dt className="text-slate-500">Sektor</dt><dd>{organization.sector ?? organization.industry ?? "neuvedeno"}</dd></div>
            <div><dt className="text-slate-500">Kritická služba</dt><dd>{organization.criticalService ?? "neuvedeno"}</dd></div>
            <div><dt className="text-slate-500">Orientační výsledek</dt><dd>{applicability}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-slate-500">Automatické posouzení je pouze orientační. Působnost musí potvrdit právní nebo compliance posouzení.</p>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Audity</h2>
          <table>
            <thead><tr><th>Název</th><th>Stav</th><th>NIS2</th></tr></thead>
            <tbody>
              {organization.audits.map((audit) => (
                <tr key={audit.id}><td><a className="text-blue-600" href={`/audits/${audit.id}`}>{audit.title}</a></td><td>{audit.status}</td><td>{Math.round(audit.nis2Score)} %</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AppShell>
  );
}
