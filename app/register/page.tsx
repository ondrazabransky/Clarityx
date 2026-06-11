"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Registrace se nepodařila.");
      return;
    }
    const result = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/self-audit" });
    if (result?.error) setError("Účet byl vytvořen, ale přihlášení se nepodařilo.");
    else window.location.href = "/self-audit";
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-md border border-slate-800 bg-white p-6 shadow-xl dark:bg-slate-950">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white"><ShieldCheck /></span>
          <div>
            <h1 className="text-lg font-semibold">Vytvoření účtu</h1>
            <p className="text-sm text-slate-500">ClarityX self-service audit</p>
          </div>
        </div>
        <label className="mb-3 block text-sm"><span className="mb-1 block font-medium">Jméno</span><input className="w-full" value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label className="mb-3 block text-sm"><span className="mb-1 block font-medium">E-mail</span><input className="w-full" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label className="mb-4 block text-sm"><span className="mb-1 block font-medium">Heslo</span><input className="w-full" type="password" minLength={10} value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
        <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Vytvořit účet</button>
        <p className="mt-4 text-center text-sm text-slate-500">Už účet máte? <Link className="text-blue-600" href="/login">Přihlásit</Link></p>
      </form>
    </main>
  );
}
