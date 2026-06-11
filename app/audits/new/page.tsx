import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewAuditPage() {
  const organizations = await prisma.organization.findMany({ orderBy: { name: "asc" } });
  return (
    <AppShell>
      <PageHeader title="Založení nového auditu" description="Formulář je připraven pro API vytvoření auditu ze šablony." />
      <Card>
        <form action="/api/audits" method="post" className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm"><span>Organizace</span><select name="organizationId">{organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
          <label className="grid gap-1 text-sm"><span>Název auditu</span><input name="title" defaultValue="Kompletní IT a kyberbezpečnostní audit" /></label>
          <label className="grid gap-1 text-sm"><span>Typ</span><select name="auditType"><option value="COMPLETE_IT_AUDIT">Kompletní IT audit</option><option value="CYBERSECURITY_AUDIT">Kyberbezpečnostní audit</option><option value="NIS2_READINESS">NIS2 readiness audit</option></select></label>
          <div className="md:col-span-2"><button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">Vytvořit audit</button></div>
        </form>
      </Card>
    </AppShell>
  );
}
