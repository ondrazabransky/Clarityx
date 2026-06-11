import { AppShell, PageHeader } from "@/components/app-shell";
import { Card, Badge } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function OrganizationsPage() {
  const organizations = await prisma.organization.findMany({ include: { audits: true }, orderBy: { name: "asc" } });
  return (
    <AppShell>
      <PageHeader title="Organizace" description="Klienti a interní společnosti v auditním portfoliu." />
      <Card>
        <table>
          <thead><tr><th>Název</th><th>IČO</th><th>Odvětví</th><th>NIS2</th><th>Audity</th></tr></thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org.id}>
                <td><a className="font-medium text-blue-600" href={`/organizations/${org.id}`}>{org.name}</a></td>
                <td>{org.ico}</td>
                <td>{org.industry}</td>
                <td><Badge tone={org.isNis2InScope ? "blue" : "slate"}>{org.entityType.replaceAll("_", " ")}</Badge></td>
                <td>{org.audits.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
