import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [totalUsers, bannedUsers, admins, posts, groups, events] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } }),
    prisma.post.count(),
    prisma.group.count(),
    prisma.event.count(),
  ]);

  return NextResponse.json({
    totalUsers,
    bannedUsers,
    admins,
    posts,
    groups,
    events,
  });
}
