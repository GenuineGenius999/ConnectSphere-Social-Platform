import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatUserAvatar } from "@/lib/queries/users";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [friendships, following] = await Promise.all([
    prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ userId }, { friendId: userId }],
      },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true, isVerified: true } },
        friend: { select: { id: true, name: true, username: true, avatar: true, isVerified: true } },
      },
    }),
    prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: { select: { id: true, name: true, username: true, avatar: true, isVerified: true } },
      },
    }),
  ]);

  const contactMap = new Map<string, { id: string; name: string; username: string; avatar: string; isVerified: boolean }>();

  for (const f of friendships) {
    const other = f.userId === userId ? f.friend : f.user;
    contactMap.set(other.id, {
      id: other.id,
      name: other.name,
      username: other.username,
      avatar: formatUserAvatar(other.avatar, other.username),
      isVerified: other.isVerified,
    });
  }

  for (const f of following) {
    const u = f.following;
    if (u.id !== userId) {
      contactMap.set(u.id, {
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: formatUserAvatar(u.avatar, u.username),
        isVerified: u.isVerified,
      });
    }
  }

  // Include platform users if list is small (so new users can message)
  if (contactMap.size < 5) {
    const others = await prisma.user.findMany({
      where: { id: { not: userId }, isBanned: false },
      take: 20,
      select: { id: true, name: true, username: true, avatar: true, isVerified: true },
      orderBy: { createdAt: "desc" },
    });
    for (const u of others) {
      contactMap.set(u.id, {
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: formatUserAvatar(u.avatar, u.username),
        isVerified: u.isVerified,
      });
    }
  }

  return NextResponse.json({ contacts: Array.from(contactMap.values()) });
}
