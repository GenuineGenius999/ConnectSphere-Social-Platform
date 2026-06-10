import { prisma } from "@/lib/prisma";

export function formatUserAvatar(avatar: string | null, username: string) {
  return avatar ?? `https://i.pravatar.cc/150?u=${encodeURIComponent(username)}`;
}

export async function getUserByUsername(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatar: formatUserAvatar(user.avatar, user.username),
    coverImage:
      user.coverImage ??
      "https://i.postimg.cc/mtD5qX0K/default-cover.jpg",
    location: user.location,
    website: user.website,
    isVerified: user.isVerified,
    role: user.role,
    followers: user._count.followers,
    following: user._count.following,
    postCount: user._count.posts,
    createdAt: user.createdAt,
  };
}

export async function getSuggestedUsers(limit = 4, excludeUserId?: string) {
  const users = await prisma.user.findMany({
    where: excludeUserId ? { id: { not: excludeUserId }, isBanned: false } : { isBanned: false },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      isVerified: true,
      bio: true,
    },
  });

  return users.map((u) => ({
    ...u,
    avatar: formatUserAvatar(u.avatar, u.username),
  }));
}

export async function getAllUsers(limit = 50) {
  return prisma.user.findMany({
    where: { isBanned: false },
    take: limit,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      isVerified: true,
      bio: true,
    },
  });
}

export async function getFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ userId }, { friendId: userId }],
    },
    include: {
      user: { select: { id: true, name: true, username: true, avatar: true, isVerified: true, bio: true } },
      friend: { select: { id: true, name: true, username: true, avatar: true, isVerified: true, bio: true } },
    },
  });

  return friendships.map((f) => {
    const u = f.userId === userId ? f.friend : f.user;
    return {
      id: u.id,
      name: u.name,
      username: u.username,
      avatar: formatUserAvatar(u.avatar, u.username),
      isVerified: u.isVerified,
      bio: u.bio ?? "",
      mutualFriends: 0,
      isOnline: false,
    };
  });
}

export async function getFriendRequests(userId: string) {
  const requests = await prisma.friendship.findMany({
    where: { friendId: userId, status: "PENDING" },
    include: {
      user: { select: { id: true, name: true, username: true, avatar: true, isVerified: true, bio: true } },
    },
  });

  return requests.map((r) => ({
    id: r.id,
    user: {
      ...r.user,
      avatar: formatUserAvatar(r.user.avatar, r.user.username),
      bio: r.user.bio ?? "",
    },
    mutualFriends: 0,
  }));
}
