import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { requestId, action } = await req.json();

  const friendship = await prisma.friendship.findUnique({ where: { id: requestId } });
  if (!friendship || friendship.friendId !== session.user.id) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (action === "accept") {
    await prisma.friendship.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });
    return NextResponse.json({ status: "ACCEPTED" });
  }

  if (action === "decline") {
    await prisma.friendship.update({
      where: { id: requestId },
      data: { status: "DECLINED" },
    });
    return NextResponse.json({ status: "DECLINED" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
