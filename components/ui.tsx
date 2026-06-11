import Link from "next/link";
import { clsx } from "clsx";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx("rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950", className)}>{children}</section>;
}

export function StatCard({ label, value, tone = "slate" }: { label: string; value: string | number; tone?: "slate" | "red" | "orange" | "yellow" | "green" | "blue" }) {
  const tones = {
    slate: "text-slate-950 dark:text-white",
    red: "text-red-600",
    orange: "text-orange-600",
    yellow: "text-yellow-600",
    green: "text-green-600",
    blue: "text-blue-600"
  };
  return (
    <Card>
      <div className="text-xs font-medium uppercase tracking-normal text-slate-500">{label}</div>
      <div className={clsx("mt-2 text-3xl font-semibold", tones[tone])}>{value}</div>
    </Card>
  );
}

export function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "red" | "orange" | "yellow" | "green" | "blue" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-200",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
    green: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200"
  };
  return <span className={clsx("inline-flex rounded px-2 py-1 text-xs font-medium", tones[tone])}>{children}</span>;
}

export function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">{children}</Link>;
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function severityTone(severity: string) {
  if (severity === "CRITICAL") return "red";
  if (severity === "HIGH") return "orange";
  if (severity === "MEDIUM") return "yellow";
  return "green";
}
