import { AppShell, PageHeader } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { email: "asc" } });
  return (
    <AppShell>
      <PageHeader title="Uživatelé" description="Role Admin, Auditor a Klient / Viewer." />
      <Card>
        <table>
          <thead><tr><th>Jméno</th><th>E-mail</th><th>Role</th><th>Vytvořeno</th></tr></thead>
          <tbody>
            {users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td><Badge tone="blue">{user.role}</Badge></td><td>{user.createdAt.toLocaleDateString("cs-CZ")}</td></tr>)}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
