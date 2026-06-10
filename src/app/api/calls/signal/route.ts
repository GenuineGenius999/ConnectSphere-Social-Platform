import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUseMessaging } from "@/lib/permissions";

const postSchema = z.object({
  roomId: z.string().min(1),
  toUserId: z.string().min(1),
  signalType: z.enum(["offer", "answer", "ice", "hangup", "ring"]),
  payload: z.string(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const since = new URL(req.url).searchParams.get("since");
  const sinceDate = since ? new Date(since) : new Date(Date.now() - 60_000);

  const signals = await prisma.callSignal.findMany({
    where: {
      toUserId: session.user.id,
      consumed: false,
      createdAt: { gte: sinceDate },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: {
      id: true,
      roomId: true,
      fromUserId: true,
      signalType: true,
      payload: true,
      createdAt: true,
    },
  });

  if (signals.length > 0) {
    await prisma.callSignal.updateMany({
      where: { id: { in: signals.map((s) => s.id) } },
      data: { consumed: true },
    });
  }

  return NextResponse.json({ signals });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!canUseMessaging(session.user)) {
    return NextResponse.json({ error: "Messaging is disabled for your account" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid signal" }, { status: 400 });

  const { roomId, toUserId, signalType, payload } = parsed.data;

  if (toUserId === session.user.id) {
    return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
  }

  const signal = await prisma.callSignal.create({
    data: {
      roomId,
      fromUserId: session.user.id,
      toUserId,
      signalType,
      payload,
    },
  });

  return NextResponse.json({ signal: { id: signal.id } }, { status: 201 });
}
