import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { AuditType } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditFromTemplate } from "@/services/audit-factory";
import { assessNis2Applicability } from "@/services/compliance";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.redirect(new URL("/login?callbackUrl=/self-audit", request.url));
  const form = await request.formData();
  const employeeCount = Number(form.get("employeeCount") || 0) || null;
  const industry = String(form.get("industry") ?? "");
  const organization = await prisma.organization.create({
    data: {
      name: String(form.get("organizationName") ?? "Nová organizace"),
      ico: String(form.get("ico") ?? "") || null,
      industry: industry || null,
      employeeCount,
      country: "CZ",
      description: String(form.get("description") ?? "") || null,
      entityType: "UNKNOWN",
      isNis2InScope: assessNis2Applicability({ sector: industry, employeeCount }).startsWith("pravděpodobně v působnosti"),
      sector: industry || null,
      nis2Notes: "Orientační posouzení ze samoobslužného vstupu. Vyžaduje ověření auditorem nebo právním posouzením."
    }
  });
  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "create_organization", entityType: "Organization", entityId: organization.id, newValue: { selfService: true } }
  });
  const audit = await createAuditFromTemplate({
    organizationId: organization.id,
    title: String(form.get("auditTitle") ?? "Samoobslužný IT a kyberbezpečnostní audit"),
    auditType: String(form.get("auditType") ?? "COMPLETE_IT_AUDIT") as AuditType,
    createdById: session.user.id,
    actorRole: session.user.role
  });
  return NextResponse.redirect(new URL(`/audits/${audit.id}/questionnaire`, request.url));
}
