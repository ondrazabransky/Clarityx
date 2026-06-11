import { notFound } from "next/navigation";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AuditTabs } from "@/components/audit-tabs";
import { Badge, Card, severityTone } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function FindingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await prisma.audit.findUnique({ where: { id }, include: { findings: { include: { question: true }, orderBy: { riskScore: "desc" } } } });
  if (!audit) notFound();
  return (
    <AppShell>
      <PageHeader title="Nálezy" description="Rizika, doporučení, priorita, vlastník a termín." />
      <AuditTabs auditId={id} />
      <Card>
        <table>
          <thead><tr><th>Nález</th><th>Závažnost</th><th>Riziko</th><th>Priorita</th><th>Stav</th><th>Vazba</th></tr></thead>
          <tbody>
            {audit.findings.map((finding) => (
              <tr key={finding.id}>
                <td><a className="font-medium text-blue-600" href={`/audits/${id}/findings/${finding.id}`}>{finding.title}</a></td>
                <td><Badge tone={severityTone(finding.severity)}>{finding.severity}</Badge></td>
                <td>{finding.riskScore}</td>
                <td>{finding.priority}</td>
                <td>{finding.status}</td>
                <td>{finding.question?.nis2RequirementCode ?? finding.question?.code ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
