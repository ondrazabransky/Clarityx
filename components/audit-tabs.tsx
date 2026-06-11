import Link from "next/link";

export function AuditTabs({ auditId }: { auditId: string }) {
  const tabs = [
    ["Dashboard", `/audits/${auditId}`],
    ["Dotazník", `/audits/${auditId}/questionnaire`],
    ["Nálezy", `/audits/${auditId}/findings`],
    ["Roadmapa", `/audits/${auditId}/roadmap`],
    ["NIS2", `/audits/${auditId}/nis2`],
    ["Report", `/audits/${auditId}/report`]
  ];
  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
      {tabs.map(([label, href]) => (
        <Link key={href} href={href} className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900">{label}</Link>
      ))}
    </div>
  );
}
