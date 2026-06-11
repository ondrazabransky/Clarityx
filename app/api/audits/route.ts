import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { AuditType } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { createAuditFromTemplate } from "@/services/audit-factory";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "AUDITOR"].includes(session.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const form = await request.formData();
  const organizationId = String(form.get("organizationId") ?? "");
  const title = String(form.get("title") ?? "Nový audit");
  const auditType = String(form.get("auditType") ?? "COMPLETE_IT_AUDIT") as AuditType;
  const audit = await createAuditFromTemplate({ organizationId, title, auditType, createdById: session.user.id, actorRole: session.user.role });
  return NextResponse.redirect(new URL(`/audits/${audit.id}`, request.url));
}
