"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, UserCircle } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <div className="rounded-md border border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-800">Načítám uživatele...</div>;
  }
  if (!session?.user) return null;
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start gap-2">
        <UserCircle className="mt-0.5 text-slate-500" size={18} />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{session.user.name ?? "Uživatel"}</div>
          <div className="truncate text-xs text-slate-500">{session.user.email}</div>
          <div className="mt-1 text-xs text-slate-500">{session.user.role}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
      >
        <LogOut size={16} />
        Odhlásit
      </button>
    </div>
  );
}
