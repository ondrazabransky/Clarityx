import Link from "next/link";
import { ClipboardCheck, LogIn, ShieldCheck } from "lucide-react";

export default function ClarityxEmbedPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-6 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white">
            <ShieldCheck size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold">ClarityX IT & Cyber Audit</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Samoobslužný audit IT, kyberbezpečnosti a NIS2 připravenosti.</p>
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <ClipboardCheck className="mt-1 text-blue-600" size={22} />
            <div>
              <h2 className="font-semibold">Jak to funguje</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Po přihlášení nebo registraci si firma založí vlastní audit, vyplní dotazník a získá okamžitý přehled skóre, nálezů, priorit a NIS2 gapů.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" href="/self-audit">
              <LogIn size={17} /> Spustit audit
            </Link>
            <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-white dark:border-slate-700 dark:hover:bg-slate-950" href="/register">
              Vytvořit účet
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
