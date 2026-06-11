import Link from "next/link";
import { BarChart3, Building2, ClipboardList, LayoutDashboard, Settings, ShieldCheck, Users } from "lucide-react";
import { UserMenu } from "@/components/user-menu";

const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Organizace", "/organizations", Building2],
  ["Audity", "/audits", ClipboardList],
  ["Šablony", "/settings/templates", Settings],
  ["Uživatelé", "/settings/users", Users]
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <ShieldCheck size={22} />
          </span>
          <span>
            <span className="block text-sm font-semibold">IT Audit Platform</span>
            <span className="block text-xs text-slate-500">NIS2 ready MVP</span>
          </span>
        </Link>
        <nav className="mt-8 space-y-1">
          {nav.map(([label, href, Icon]) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900">
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
            <div className="flex items-center gap-2 font-semibold"><BarChart3 size={14} /> Tři skóre</div>
            IT maturity, cybersecurity maturity a NIS2 readiness jsou počítány odděleně.
          </div>
          <UserMenu />
        </div>
      </aside>
      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-400">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
