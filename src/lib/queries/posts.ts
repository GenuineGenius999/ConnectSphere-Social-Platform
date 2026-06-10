import { prisma } from "@/lib/prisma";

export async function getFeedPosts(limit = 20) {
  const posts = await prisma.post.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          isVerified: true,
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return posts.map((post) => ({
    id: post.id,
    content: post.content,
    image: post.image,
    video: post.video,
    location: post.location,
    createdAt: post.createdAt,
    likes: post._count.likes,
    comments: post._count.comments,
    shares: 0,
    author: {
      name: post.author.name,
      username: post.author.username,
      avatar: post.author.avatar ?? `https://i.pravatar.cc/150?u=${post.author.username}`,
      isVerified: post.author.isVerified,
    },
  }));
}

export async function getPostsByUsername(username: string, limit = 20) {
  const posts = await prisma.post.findMany({
    where: { author: { username } },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          isVerified: true,
        },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return posts.map((post) => ({
    id: post.id,
    content: post.content,
    image: post.image,
    video: post.video,
    location: post.location,
    createdAt: post.createdAt,
    likes: post._count.likes,
    comments: post._count.comments,
    shares: 0,
    author: {
      name: post.author.name,
      username: post.author.username,
      avatar: post.author.avatar ?? `https://i.pravatar.cc/150?u=${post.author.username}`,
      isVerified: post.author.isVerified,
    },
  }));
}

export async function getPostLikeStatus(postIds: string[], userId?: string) {
  if (!userId || postIds.length === 0) return new Set<string>();

  const likes = await prisma.like.findMany({
    where: { userId, postId: { in: postIds } },
    select: { postId: true },
  });

  return new Set(likes.map((l) => l.postId));
}

export async function getPostSavedStatus(postIds: string[], userId?: string) {
  if (!userId || postIds.length === 0) return new Set<string>();

  const saved = await prisma.savedPost.findMany({
    where: { userId, postId: { in: postIds } },
    select: { postId: true },
  });

  return new Set(saved.map((s) => s.postId));
}
