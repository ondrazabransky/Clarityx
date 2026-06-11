import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { exportAuditJson, exportAuditPdf, exportAuditXlsx } from "@/services/export";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "json";
  const type = (url.searchParams.get("type") ?? "executive") as "executive" | "technical" | "nis2";
  await prisma.auditLog.create({ data: { userId: session.user.id, action: "export_data", entityType: "Audit", entityId: id, newValue: { format, type } } });
  if (format === "xlsx") {
    const data = await exportAuditXlsx(id);
    return new NextResponse(data as BodyInit, { headers: { "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "content-disposition": `attachment; filename="audit-${id}.xlsx"` } });
  }
  if (format === "pdf") {
    const data = await exportAuditPdf(id, type);
    return new NextResponse(data as BodyInit, { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="audit-${id}-${type}.pdf"` } });
  }
  const json = await exportAuditJson(id);
  return new NextResponse(json, { headers: { "content-type": "application/json", "content-disposition": `attachment; filename="audit-${id}.json"` } });
}
