import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");

  const [unreadNotifications, unreadMessages, recentPosts] = await Promise.all([
    prisma.notification.count({ where: { userId: session.user.id, isRead: false } }),
    prisma.message.count({ where: { receiverId: session.user.id, isRead: false } }),
    since
      ? prisma.post.count({ where: { createdAt: { gt: new Date(since) } } })
      : Promise.resolve(0),
  ]);

  const pendingFriendRequests = await prisma.friendship.count({
    where: { friendId: session.user.id, status: "PENDING" },
  });

  return NextResponse.json({
    unreadNotifications,
    unreadMessages,
    pendingFriendRequests,
    newPosts: recentPosts,
    timestamp: new Date().toISOString(),
  });
}
