import { AppShell, PageHeader } from "@/components/app-shell";
import { ButtonLink, Card, Badge } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AuditsPage() {
  const audits = await prisma.audit.findMany({ include: { organization: true }, orderBy: { updatedAt: "desc" } });
  return (
    <AppShell>
      <PageHeader title="Audity" description="Kompletní IT, kyberbezpečnostní a NIS2 audity." actions={<ButtonLink href="/audits/new">Nový audit</ButtonLink>} />
      <Card>
        <table>
          <thead><tr><th>Audit</th><th>Organizace</th><th>Typ</th><th>Stav</th><th>IT</th><th>Cyber</th><th>NIS2</th></tr></thead>
          <tbody>
            {audits.map((audit) => (
              <tr key={audit.id}>
                <td><a className="font-medium text-blue-600" href={`/audits/${audit.id}`}>{audit.title}</a></td>
                <td>{audit.organization.name}</td>
                <td>{audit.auditType}</td>
                <td><Badge>{audit.status}</Badge></td>
                <td>{Math.round(audit.itScore)} %</td>
                <td>{Math.round(audit.cybersecurityScore)} %</td>
                <td>{Math.round(audit.nis2Score)} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
