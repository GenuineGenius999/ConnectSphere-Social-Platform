import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";
import { uploadToPostimages } from "../src/lib/postimages";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter });

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

async function seedImage(name: string): Promise<string | null> {
  if (!process.env.POSTIMAGES_API_KEY) return null;
  try {
    const result = await uploadToPostimages(TINY_PNG, `${name}.png`, "image/png");
    return result.directUrl;
  } catch {
    return null;
  }
}

async function main() {
  console.log("🌱 Seeding ConnectSphere database...");

  const userPassword = await bcrypt.hash("password123", 12);
  const adminPassword = await bcrypt.hash("admin123", 12);

  const [avatarAdmin, avatarAlex, postImg1, postImg2, coverImg] = await Promise.all([
    seedImage("avatar-admin"),
    seedImage("avatar-alex"),
    seedImage("post-1"),
    seedImage("post-2"),
    seedImage("cover-1"),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: "admin@connectsphere.com" },
    update: { role: "SUPER_ADMIN", isVerified: true },
    create: {
      email: "admin@connectsphere.com",
      username: "admin",
      password: adminPassword,
      name: "Platform Admin",
      bio: "ConnectSphere Super Administrator",
      avatar: avatarAdmin,
      coverImage: coverImg,
      role: "SUPER_ADMIN",
      isVerified: true,
      canGoLive: true,
    },
  });

  const alex = await prisma.user.upsert({
    where: { email: "alex@connectsphere.com" },
    update: {},
    create: {
      email: "alex@connectsphere.com",
      username: "alexmorgan",
      password: userPassword,
      name: "Alex Morgan",
      bio: "Digital creator · Travel enthusiast · Coffee lover ☕",
      avatar: avatarAlex,
      coverImage: coverImg,
      location: "San Francisco, CA",
      website: "alexmorgan.com",
      isVerified: true,
      canGoLive: true,
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: "sarah@example.com" },
    update: {},
    create: {
      email: "sarah@example.com",
      username: "sarahchen",
      password: userPassword,
      name: "Sarah Chen",
      bio: "Photographer & visual storyteller",
      isVerified: true,
      role: "MODERATOR",
    },
  });

  const mike = await prisma.user.upsert({
    where: { email: "mike@example.com" },
    update: {},
    create: {
      email: "mike@example.com",
      username: "mikej",
      password: userPassword,
      name: "Mike Johnson",
      bio: "Software engineer building the future",
    },
  });

  const emma = await prisma.user.upsert({
    where: { email: "emma@example.com" },
    update: {},
    create: {
      email: "emma@example.com",
      username: "emmaw",
      password: userPassword,
      name: "Emma Wilson",
      bio: "Fashion designer | NYC",
      isVerified: true,
    },
  });

  const james = await prisma.user.upsert({
    where: { email: "james@example.com" },
    update: {},
    create: {
      email: "james@example.com",
      username: "jamespark",
      password: userPassword,
      name: "James Park",
      bio: "Fitness coach & nutrition expert",
    },
  });

  const lisa = await prisma.user.upsert({
    where: { email: "lisa@example.com" },
    update: {},
    create: {
      email: "lisa@example.com",
      username: "lisaa",
      password: userPassword,
      name: "Lisa Anderson",
      bio: "Food blogger & recipe creator",
      isVerified: true,
    },
  });

  const users = [alex, sarah, mike, emma, james, lisa];

  // Follows
  for (const u of users) {
    if (u.id !== alex.id) {
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId: alex.id, followingId: u.id } },
        update: {},
        create: { followerId: alex.id, followingId: u.id },
      });
    }
  }

  // Friendships
  await prisma.friendship.upsert({
    where: { userId_friendId: { userId: sarah.id, friendId: alex.id } },
    update: { status: "ACCEPTED" },
    create: { userId: sarah.id, friendId: alex.id, status: "ACCEPTED" },
  });

  await prisma.friendship.upsert({
    where: { userId_friendId: { userId: mike.id, friendId: alex.id } },
    update: { status: "PENDING" },
    create: { userId: mike.id, friendId: alex.id, status: "PENDING" },
  });

  // Posts
  const postContents = [
    { content: "Golden hour at the coast never gets old. There's something magical about watching the sun paint the sky. 🌅", image: postImg1, author: sarah, location: "Big Sur, CA" },
    { content: "Just shipped a major feature at work! 6 months of hard work finally paying off. Grateful for an amazing team. 🚀", image: null, author: mike },
    { content: "New collection dropping next week! Inspired by the streets of Tokyo and the elegance of Paris.", image: postImg2, author: emma },
    { content: "Morning workout complete! 💪 Remember: consistency beats intensity.", image: null, author: james, location: "Central Park" },
    { content: "Homemade sourdough bread fresh from the oven. Recipe coming soon on my blog! 🍞", image: null, author: lisa },
    { content: "Exploring the city with friends. Life is good when you're surrounded by great people.", image: postImg1, author: alex, location: "San Francisco" },
  ];

  const existingPosts = await prisma.post.count();
  if (existingPosts < 3) {
    for (const p of postContents) {
      await prisma.post.create({
        data: {
          content: p.content,
          image: p.image,
          location: p.location ?? null,
          authorId: p.author.id,
        },
      });
    }
  }

  const posts = await prisma.post.findMany({ take: 6 });

  // Likes & comments
  for (const post of posts.slice(0, 3)) {
    await prisma.like.upsert({
      where: { userId_postId: { userId: alex.id, postId: post.id } },
      update: {},
      create: { userId: alex.id, postId: post.id },
    });
    await prisma.comment.create({
      data: {
        content: "This is amazing! 🔥",
        authorId: sarah.id,
        postId: post.id,
      },
    }).catch(() => {});
  }

  // Stories (expire in 24h)
  const storyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const storyUsers = [sarah, emma, james];
  for (const u of storyUsers) {
    const img = await seedImage(`story-${u.username}`);
    if (img) {
      await prisma.story.create({
        data: { image: img, expiresAt: storyExpiry, authorId: u.id },
      }).catch(() => {});
    }
  }

  // Messages
  await prisma.message.createMany({
    data: [
      { content: "Hey! How are you doing?", senderId: sarah.id, receiverId: alex.id },
      { content: "I'm great! Just got back from a hike.", senderId: alex.id, receiverId: sarah.id },
      { content: "That photo from yesterday was incredible! 📸", senderId: sarah.id, receiverId: alex.id, isRead: false },
      { content: "Are you free for coffee this weekend?", senderId: mike.id, receiverId: alex.id },
    ],
    skipDuplicates: true,
  });

  // Notifications for alex
  await prisma.notification.createMany({
    data: [
      { userId: alex.id, type: "LIKE", content: `${sarah.id}|liked your photo`, isRead: false },
      { userId: alex.id, type: "COMMENT", content: `${sarah.id}|commented: "This is amazing! 🔥"`, isRead: false },
      { userId: alex.id, type: "FOLLOW", content: `${emma.id}|started following you`, isRead: false },
      { userId: alex.id, type: "FRIEND_REQUEST", content: `${mike.id}|sent you a friend request`, isRead: true },
    ],
    skipDuplicates: true,
  });

  // Groups
  const groupCount = await prisma.group.count();
  if (groupCount === 0) {
    const g1 = await prisma.group.create({
      data: {
        name: "Photography Enthusiasts",
        description: "Share your best shots and learn from pros",
        coverImage: coverImg,
      },
    });
    const g2 = await prisma.group.create({
      data: {
        name: "Tech Innovators",
        description: "Discuss the latest in technology and startups",
      },
    });
    for (const u of users.slice(0, 4)) {
      await prisma.groupMember.create({ data: { userId: u.id, groupId: g1.id } }).catch(() => {});
      await prisma.groupMember.create({ data: { userId: u.id, groupId: g2.id } }).catch(() => {});
    }
  }

  // Events
  if ((await prisma.event.count()) === 0) {
    const e1 = await prisma.event.create({
      data: {
        title: "Summer Music Festival 2026",
        description: "The biggest music event of the year",
        location: "Golden Gate Park, SF",
        startDate: new Date("2026-07-15"),
        endDate: new Date("2026-07-17"),
      },
    });
    await prisma.eventAttendee.createMany({
      data: users.slice(0, 3).map((u) => ({ userId: u.id, eventId: e1.id })),
      skipDuplicates: true,
    });
  }

  // Marketplace
  if ((await prisma.marketplaceItem.count()) === 0) {
    const itemImg = await seedImage("marketplace-item");
    await prisma.marketplaceItem.createMany({
      data: [
        { title: "Apple Watch Series 9", price: 299, category: "Electronics", condition: "Like New", location: "San Francisco", sellerId: mike.id, image: itemImg },
        { title: "Sony WH-1000XM5", price: 249, category: "Electronics", condition: "Good", location: "Oakland", sellerId: sarah.id, image: itemImg },
        { title: "Vintage Leather Bag", price: 175, category: "Fashion", condition: "Good", location: "SF Mission", sellerId: emma.id, image: itemImg },
      ],
    });
  }

  // Reels
  if ((await prisma.reel.count()) === 0) {
    const reelImg = await seedImage("reel-thumb");
    await prisma.reel.createMany({
      data: [
        { video: reelImg ?? "", caption: "Sunset vibes 🌅", views: 125000, authorId: sarah.id },
        { video: reelImg ?? "", caption: "Fashion week highlights", views: 89000, authorId: emma.id },
        { video: reelImg ?? "", caption: "60-second pasta recipe 🍝", views: 234000, authorId: lisa.id },
      ],
    });
  }

  // Pages
  if ((await prisma.page.count()) === 0) {
    const pageImg = await seedImage("page-avatar");
    const p1 = await prisma.page.create({
      data: { name: "ConnectSphere News", category: "Media", ownerId: admin.id, avatar: pageImg },
    });
    await prisma.pageFollow.create({ data: { userId: alex.id, pageId: p1.id } }).catch(() => {});
  }

  // Saved posts
  if (posts[0]) {
    await prisma.savedPost.upsert({
      where: { userId_postId: { userId: alex.id, postId: posts[0].id } },
      update: {},
      create: { userId: alex.id, postId: posts[0].id },
    });
  }

  // Watch videos
  if ((await prisma.watchVideo.count()) === 0) {
    const thumb = await seedImage("watch-thumb");
    await prisma.watchVideo.createMany({
      data: [
        { title: "Exploring California Coast", channel: "Travel Diaries", views: 2400000, duration: "12:34", thumbnail: thumb },
        { title: "Building a Social App", channel: "Code Academy", views: 890000, duration: "45:20", thumbnail: thumb },
        { title: "Ultimate Pasta Masterclass", channel: "Chef's Kitchen", views: 1200000, duration: "28:15", thumbnail: thumb },
        { title: "Morning Yoga Flow", channel: "Zen Life", views: 560000, duration: "32:00", thumbnail: thumb },
      ],
    });
  }

  // Live streams
  if ((await prisma.liveStream.count()) === 0) {
    const thumb = await seedImage("live-thumb");
    await prisma.liveStream.createMany({
      data: [
        { title: "Cooking Live: Italian Night", streamerId: lisa.id, viewers: 2340, thumbnail: thumb },
        { title: "Gaming: Epic Battle Royale", streamerId: mike.id, viewers: 8900, thumbnail: thumb },
        { title: "Sunset DJ Set", streamerId: sarah.id, viewers: 15600, thumbnail: thumb },
      ],
    });
  }

  // Games
  if ((await prisma.game.count()) === 0) {
    const img = await seedImage("game-thumb");
    await prisma.game.createMany({
      data: [
        { name: "Word Quest", players: 2400000, category: "Puzzle", image: img },
        { name: "City Builder", players: 890000, category: "Strategy", image: img },
        { name: "Racing Thunder", players: 1200000, category: "Racing", image: img },
        { name: "Quiz Masters", players: 3400000, category: "Trivia", image: img },
      ],
    });
  }

  console.log("✅ Seed completed! Sample data is in your MySQL database.");
  if (!process.env.POSTIMAGES_API_KEY) {
    console.log("   ℹ️  Set POSTIMAGES_API_KEY in .env to seed with Postimages image URLs");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
