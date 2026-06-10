import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const [
    users, bannedUsers, admins, moderators, verifiedUsers,
    posts, comments, likes, stories, messages, notifications,
    groups, events, marketplaceItems, reels, pages, savedPosts,
    friendships, follows, liveStreams, watchVideos, games,
    pendingReports,
    recentUsers, recentPosts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } }),
    prisma.user.count({ where: { role: "MODERATOR" } }),
    prisma.user.count({ where: { isVerified: true } }),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.like.count(),
    prisma.story.count(),
    prisma.message.count(),
    prisma.notification.count(),
    prisma.group.count(),
    prisma.event.count(),
    prisma.marketplaceItem.count(),
    prisma.reel.count(),
    prisma.page.count(),
    prisma.savedPost.count(),
    prisma.friendship.count({ where: { status: "ACCEPTED" } }),
    prisma.follow.count(),
    prisma.liveStream.count(),
    prisma.watchVideo.count(),
    prisma.game.count(),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, username: true, createdAt: true, role: true } }),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, content: true, createdAt: true, author: { select: { name: true, username: true } } },
    }),
  ]);

  const usersByRole = await prisma.user.groupBy({ by: ["role"], _count: { id: true } });

  return NextResponse.json({
    stats: {
      users, bannedUsers, admins, moderators, verifiedUsers,
      posts, comments, likes, stories, messages, notifications,
      groups, events, marketplaceItems, reels, pages, savedPosts,
      friendships, follows, liveStreams, watchVideos, games,
      pendingReports,
    },
    usersByRole,
    recentUsers,
    recentPosts,
    timestamp: new Date().toISOString(),
  });
}
