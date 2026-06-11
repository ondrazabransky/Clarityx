import { notFound } from "next/navigation";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AuditTabs } from "@/components/audit-tabs";
import { Badge, Card } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RoadmapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await prisma.audit.findUnique({ where: { id }, include: { roadmapItems: { orderBy: [{ priority: "asc" }, { dueDate: "asc" }] } } });
  if (!audit) notFound();
  const periods = ["0-30 dní", "31-90 dní", "91-180 dní", "181-365 dní"];
  return (
    <AppShell>
      <PageHeader title="Roadmapa opatření" description="Prioritizace opatření podle rizika a NIS2 gapů." />
      <AuditTabs auditId={id} />
      <div className="grid gap-6 lg:grid-cols-4">
        {periods.map((period) => (
          <Card key={period}>
            <h2 className="mb-3 font-semibold">{period}</h2>
            <div className="space-y-3">
              {audit.roadmapItems.filter((item) => item.quarter === period).map((item) => (
                <div key={item.id} className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
                  <div className="font-medium">{item.title}</div>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">{item.description}</p>
                  <div className="mt-2 flex gap-2"><Badge tone="blue">{item.priority}</Badge>{item.isNis2 ? <Badge tone="yellow">NIS2</Badge> : null}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
