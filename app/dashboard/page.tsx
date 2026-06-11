import { AppShell, PageHeader } from "@/components/app-shell";
import { ButtonLink, Card, StatCard } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [audits, organizations, findings] = await Promise.all([
    prisma.audit.findMany({ include: { organization: true }, orderBy: { updatedAt: "desc" }, take: 8 }),
    prisma.organization.findMany({ orderBy: { updatedAt: "desc" }, take: 8 }),
    prisma.finding.findMany({ orderBy: { riskScore: "desc" }, take: 8 })
  ]);
  return (
    <AppShell>
      <PageHeader
        title="Manažerský dashboard"
        description="Přehled klientů, auditů, rizik a NIS2 readiness napříč portfoliem."
        actions={<ButtonLink href="/audits/new">Nový audit</ButtonLink>}
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Organizace" value={organizations.length} />
        <StatCard label="Audity" value={audits.length} tone="blue" />
        <StatCard label="Kritické nálezy" value={findings.filter((f) => f.severity === "CRITICAL").length} tone="red" />
        <StatCard label="High nálezy" value={findings.filter((f) => f.severity === "HIGH").length} tone="orange" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Poslední audity</h2>
          <table>
            <thead><tr><th>Audit</th><th>Organizace</th><th>IT</th><th>NIS2</th></tr></thead>
            <tbody>
              {audits.map((audit) => (
                <tr key={audit.id}>
                  <td><a className="font-medium text-blue-600" href={`/audits/${audit.id}`}>{audit.title}</a></td>
                  <td>{audit.organization.name}</td>
                  <td>{Math.round(audit.itScore)} %</td>
                  <td>{Math.round(audit.nis2Score)} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Top rizika</h2>
          <table>
            <thead><tr><th>Nález</th><th>Závažnost</th><th>Skóre</th></tr></thead>
            <tbody>
              {findings.map((finding) => (
                <tr key={finding.id}><td>{finding.title}</td><td>{finding.severity}</td><td>{finding.riskScore}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AppShell>
  );
}
