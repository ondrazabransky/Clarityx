import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { auditSections, nis2Requirements, recommendationLibrary } from "@/lib/audit-template";

export default function TemplatesPage() {
  return (
    <AppShell>
      <PageHeader title="Auditní šablony" description="První verze obsahuje kompletní IT audit, kyberbezpečnostní audit a NIS2 mapování." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Auditní oblasti</h2>
          <table>
            <thead><tr><th>Oblast</th><th>Otázky</th><th>Váha</th></tr></thead>
            <tbody>{auditSections.map((section) => <tr key={section.code}><td>{section.title}</td><td>{section.questions.length}</td><td>{section.weight}</td></tr>)}</tbody>
          </table>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">NIS2 požadavky</h2>
          <table>
            <thead><tr><th>Kód</th><th>Název</th><th>Článek</th></tr></thead>
            <tbody>{nis2Requirements.map((r) => <tr key={r.code}><td><Badge tone="blue">{r.code}</Badge></td><td>{r.title}</td><td>{r.article}</td></tr>)}</tbody>
          </table>
        </Card>
      </div>
      <Card className="mt-6">
        <h2 className="mb-3 font-semibold">Knihovna doporučení</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {recommendationLibrary.map(([title, text]) => <div key={title} className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800"><div className="font-medium">{title}</div><p className="mt-1 text-slate-600 dark:text-slate-400">{text}</p></div>)}
        </div>
      </Card>
    </AppShell>
  );
}
