import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      avatar: true,
      role: true,
      isVerified: true,
      isBanned: true,
      canPost: true,
      canComment: true,
      canMessage: true,
      canVoiceCall: true,
      canVideoCall: true,
      canGoLive: true,
      canCreateGroups: true,
      canSellItems: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}
