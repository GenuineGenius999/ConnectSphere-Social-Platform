import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidPostImageUrl, isValidPostVideoUrl } from "@/lib/media";

const mediaUrlSchema = z.string().min(1).optional().nullable();

const createPostSchema = z.object({
  content: z.string().min(1).max(5000),
  image: mediaUrlSchema,
  video: mediaUrlSchema,
  location: z.string().max(200).optional().nullable(),
});

export async function GET() {
  const posts = await prisma.post.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatar: true, isVerified: true },
      },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.user.canPost) {
    return NextResponse.json({ error: "You do not have permission to post" }, { status: 403 });
  }

  if (session.user.isBanned) {
    return NextResponse.json({ error: "Account banned" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { content, image, video, location } = parsed.data;

    if (image && !isValidPostImageUrl(image)) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    if (video && !isValidPostVideoUrl(video)) {
      return NextResponse.json({ error: "Videos must be uploaded to this platform" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        content,
        image: image ?? null,
        video: video ?? null,
        location: location ?? null,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, avatar: true, isVerified: true },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
