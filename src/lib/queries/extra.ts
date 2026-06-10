import { prisma } from "@/lib/prisma";
import { formatUserAvatar } from "./users";

export async function searchAll(query: string) {
  if (!query.trim()) return { users: [], posts: [], groups: [] };

  const q = query.trim();

  const [users, posts, groups] = await Promise.all([
    prisma.user.findMany({
      where: {
        isBanned: false,
        OR: [
          { name: { contains: q } },
          { username: { contains: q } },
          { bio: { contains: q } },
        ],
      },
      take: 10,
      select: { id: true, name: true, username: true, avatar: true, isVerified: true, bio: true },
    }),
    prisma.post.findMany({
      where: { content: { contains: q } },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, username: true, avatar: true } },
      },
    }),
    prisma.group.findMany({
      where: { OR: [{ name: { contains: q } }, { description: { contains: q } }] },
      take: 10,
      include: { _count: { select: { members: true } } },
    }),
  ]);

  return {
    users: users.map((u) => ({ ...u, avatar: formatUserAvatar(u.avatar, u.username) })),
    posts,
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      members: g._count.members,
      image: g.coverImage ?? g.avatar ?? "",
    })),
  };
}

export async function getWatchVideos() {
  return prisma.watchVideo.findMany({ orderBy: { views: "desc" } });
}

export async function getLiveStreams() {
  return prisma.liveStream.findMany({
    where: { isLive: true },
    orderBy: { viewers: "desc" },
    include: {
      streamer: { select: { name: true, username: true, avatar: true, isVerified: true } },
    },
  }).then((streams) =>
    streams.map((s) => ({
      id: s.id,
      title: s.title,
      viewers: s.viewers,
      thumbnail: s.thumbnail ?? "",
      streamer: {
        name: s.streamer.name,
        username: s.streamer.username,
        avatar: formatUserAvatar(s.streamer.avatar, s.streamer.username),
        isVerified: s.streamer.isVerified,
      },
    }))
  );
}

export async function getGames() {
  return prisma.game.findMany({ orderBy: { players: "desc" } });
}

export async function getMemories(userId: string) {
  const posts = await prisma.post.findMany({
    where: { authorId: userId, image: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return posts.map((p) => ({
    id: p.id,
    year: p.createdAt.getFullYear(),
    title: p.content.slice(0, 60) + (p.content.length > 60 ? "..." : ""),
    image: p.image!,
    date: p.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
  }));
}
