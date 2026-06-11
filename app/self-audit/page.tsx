import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Card } from "@/components/ui";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SelfAuditPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/self-audit");
  return (
    <AppShell>
      <PageHeader
        title="Spustit vlastní audit"
        description="Založte organizaci a samoobslužný audit. Po vytvoření budete rovnou přesměrováni do dotazníku."
      />
      <Card>
        <form action="/api/self-audit" method="post" className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span>Název organizace</span>
            <input name="organizationName" required placeholder="Např. ClarityX Demo s.r.o." />
          </label>
          <label className="grid gap-1 text-sm">
            <span>IČO</span>
            <input name="ico" placeholder="Volitelné" />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Odvětví</span>
            <input name="industry" placeholder="Výroba, IT služby, servis..." />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Počet zaměstnanců</span>
            <input name="employeeCount" type="number" min="0" placeholder="Např. 80" />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Typ auditu</span>
            <select name="auditType" defaultValue="COMPLETE_IT_AUDIT">
              <option value="COMPLETE_IT_AUDIT">Kompletní IT audit</option>
              <option value="CYBERSECURITY_AUDIT">Kyberbezpečnostní audit</option>
              <option value="NIS2_READINESS">NIS2 readiness audit</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span>Název auditu</span>
            <input name="auditTitle" defaultValue="Samoobslužný IT a kyberbezpečnostní audit" />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            <span>Poznámka</span>
            <textarea name="description" rows={3} placeholder="Stručný popis prostředí nebo cíle auditu." />
          </label>
          <div className="md:col-span-2">
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Založit audit a začít</button>
          </div>
        </form>
      </Card>
    </AppShell>
  );
}
