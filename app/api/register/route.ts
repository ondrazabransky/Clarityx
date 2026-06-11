import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "Jméno je povinné."),
  email: z.string().email("Zadejte platný e-mail.").toLowerCase(),
  password: z.string().min(10, "Heslo musí mít alespoň 10 znaků.")
});

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Neplatná data." }, { status: 400 });
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: "Účet s tímto e-mailem už existuje." }, { status: 409 });
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      role: "VIEWER"
    }
  });
  await prisma.auditLog.create({ data: { userId: user.id, action: "register", entityType: "User", entityId: user.id } });
  return NextResponse.json({ ok: true });
}
