import { prisma } from "@/lib/prisma";
import { formatUserAvatar } from "./users";

export async function getStories() {
  const stories = await prisma.story.findMany({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatar: true, isVerified: true },
      },
    },
  });

  const seen = new Set<string>();
  const unique: typeof stories = [];

  for (const story of stories) {
    if (!seen.has(story.authorId)) {
      seen.add(story.authorId);
      unique.push(story);
    }
  }

  return unique.map((story, i) => ({
    id: story.id,
    user: {
      name: story.author.name,
      username: story.author.username,
      avatar: formatUserAvatar(story.author.avatar, story.author.username),
      isVerified: story.author.isVerified,
    },
    image: story.image,
    hasNew: i < 5,
  }));
}

export async function getNotifications(userId: string, limit = 20) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const actorIds = [...new Set(notifications.map((n) => n.content.split("|")[0]).filter(Boolean))];
  const actors = await prisma.user.findMany({
    where: { id: { in: actorIds } },
    select: { id: true, name: true, username: true, avatar: true, isVerified: true },
  });
  const actorMap = new Map(actors.map((a) => [a.id, a]));

  return notifications.map((n) => {
    const [actorId, ...rest] = n.content.split("|");
    const actor = actorMap.get(actorId);
    const typeMap: Record<string, string> = {
      LIKE: "like",
      COMMENT: "comment",
      FOLLOW: "follow",
      FRIEND_REQUEST: "friend",
      MESSAGE: "mention",
      EVENT: "event",
      GROUP: "mention",
      MENTION: "mention",
    };

    return {
      id: n.id,
      type: typeMap[n.type] ?? "mention",
      user: actor
        ? {
            name: actor.name,
            username: actor.username,
            avatar: formatUserAvatar(actor.avatar, actor.username),
            isVerified: actor.isVerified,
          }
        : { name: "Someone", username: "user", avatar: "https://i.pravatar.cc/150?u=system", isVerified: false },
      content: rest.join("|") || n.content,
      time: n.createdAt,
      isRead: n.isRead,
    };
  });
}

export async function getConversations(userId: string) {
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true, username: true, avatar: true, isVerified: true } },
      receiver: { select: { id: true, name: true, username: true, avatar: true, isVerified: true } },
    },
  });

  const convMap = new Map<string, (typeof messages)[0]>();
  for (const msg of messages) {
    const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!convMap.has(otherId)) convMap.set(otherId, msg);
  }

  const results = await Promise.all(
    Array.from(convMap.entries()).map(async ([otherId, lastMsg]) => {
      const other = lastMsg.senderId === userId ? lastMsg.receiver : lastMsg.sender;
      const unread = await prisma.message.count({
        where: { senderId: otherId, receiverId: userId, isRead: false },
      });

      return {
        id: otherId,
        user: {
          name: other.name,
          username: other.username,
          avatar: formatUserAvatar(other.avatar, other.username),
          isVerified: other.isVerified,
        },
        lastMessage: lastMsg.content,
        time: lastMsg.createdAt,
        unread,
        online: false,
      };
    })
  );

  return results;
}

export async function getMessagesBetween(userId: string, otherUserId: string) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, content: true, image: true, senderId: true, createdAt: true },
  }).then((msgs) =>
    msgs.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      content: m.content,
      image: m.image,
      time: m.createdAt,
    }))
  );
}

export async function getGroups() {
  return prisma.group.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { members: true } } },
  }).then((groups) =>
    groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description ?? "",
      image: g.coverImage ?? g.avatar ?? "",
      members: g._count.members,
      privacy: g.privacy.toLowerCase(),
    }))
  );
}

export async function getEvents() {
  return prisma.event.findMany({
    orderBy: { startDate: "asc" },
    include: { _count: { select: { attendees: true } } },
  }).then((events) =>
    events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      location: e.location ?? "TBA",
      attendees: e._count.attendees,
      interested: e._count.attendees * 3,
      image: e.coverImage ?? "",
    }))
  );
}

export async function getMarketplaceItems() {
  return prisma.marketplaceItem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      seller: { select: { name: true, username: true } },
    },
  }).then((items) =>
    items.map((i) => ({
      id: i.id,
      title: i.title,
      price: i.price,
      location: i.location ?? "",
      image: i.image ?? "",
      category: i.category,
      condition: i.condition,
    }))
  );
}

export async function getReels() {
  return prisma.reel.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, username: true, avatar: true, isVerified: true } },
    },
  }).then((reels) =>
    reels.map((r) => ({
      id: r.id,
      thumbnail: r.video,
      views: r.views,
      likes: Math.floor(r.views * 0.07),
      caption: r.caption ?? "",
      author: {
        name: r.author.name,
        username: r.author.username,
        avatar: formatUserAvatar(r.author.avatar, r.author.username),
        isVerified: r.author.isVerified,
      },
    }))
  );
}

export async function getPages() {
  return prisma.page.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { followers: true } } },
  }).then((pages) =>
    pages.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      followers: p._count.followers,
      avatar: p.avatar ?? "",
      verified: true,
    }))
  );
}

export async function getSavedPosts(userId: string) {
  const saved = await prisma.savedPost.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        include: {
          author: { select: { name: true, username: true, avatar: true, isVerified: true } },
          _count: { select: { likes: true, comments: true } },
        },
      },
    },
  });

  return saved.map((s) => ({
    id: s.post.id,
    content: s.post.content,
    image: s.post.image,
    createdAt: s.post.createdAt,
    likes: s.post._count.likes,
    comments: s.post._count.comments,
    shares: 0,
    author: {
      name: s.post.author.name,
      username: s.post.author.username,
      avatar: formatUserAvatar(s.post.author.avatar, s.post.author.username),
      isVerified: s.post.author.isVerified,
    },
  }));
}

export async function getExplorePosts(limit = 12) {
  const posts = await prisma.post.findMany({
    where: { image: { not: null } },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { likes: true } } },
  });

  return posts.map((p) => ({
    id: p.id,
    image: p.image!,
    likes: p._count.likes,
  }));
}
