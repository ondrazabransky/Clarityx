"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("ChangeMe123!");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/dashboard" });
    if (result?.error) setError("Přihlášení se nepodařilo.");
    else window.location.href = "/dashboard";
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-md border border-slate-800 bg-white p-6 shadow-xl dark:bg-slate-950">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white"><ShieldCheck /></span>
          <div>
            <h1 className="text-lg font-semibold">Přihlášení</h1>
            <p className="text-sm text-slate-500">IT & Cybersecurity Audit Platform</p>
          </div>
        </div>
        <label className="mb-3 block text-sm">
          <span className="mb-1 block font-medium">E-mail</span>
          <input className="w-full" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-medium">Heslo</span>
          <input className="w-full" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
        <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Přihlásit</button>
        <p className="mt-4 text-center text-sm text-slate-500">Nemáte účet? <Link className="text-blue-600" href="/register">Vytvořit účet</Link></p>
        <div className="mt-4 rounded-md bg-slate-100 p-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          Demo účty: admin@example.com, auditor@example.com, viewer@example.com. Heslo pro všechny: ChangeMe123!
        </div>
      </form>
    </main>
  );
}
