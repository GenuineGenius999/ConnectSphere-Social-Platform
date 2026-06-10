import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  type: z.enum(["POST", "COMMENT", "USER", "MESSAGE"]),
  targetId: z.string().min(1),
  reason: z.string().min(3).max(200),
  details: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.isBanned) return NextResponse.json({ error: "Account banned" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { type, targetId, reason, details } = parsed.data;

  const existing = await prisma.report.findFirst({
    where: {
      reporterId: session.user.id,
      type,
      targetId,
      status: { in: ["PENDING", "REVIEWING"] },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "You already reported this item" }, { status: 409 });
  }

  const report = await prisma.report.create({
    data: {
      type,
      targetId,
      reason,
      details: details ?? null,
      reporterId: session.user.id,
    },
  });

  return NextResponse.json({ report: { id: report.id } }, { status: 201 });
}
