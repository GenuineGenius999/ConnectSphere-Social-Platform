import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  postId: z.string(),
  content: z.string().min(1).max(2000),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  if (!postId) return NextResponse.json({ error: "postId required" }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, username: true, avatar: true, isVerified: true } },
    },
  });

  return NextResponse.json({ comments });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.canComment) return NextResponse.json({ error: "No permission to comment" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const comment = await prisma.comment.create({
    data: {
      content: parsed.data.content,
      postId: parsed.data.postId,
      authorId: session.user.id,
    },
    include: {
      author: { select: { id: true, name: true, username: true, avatar: true, isVerified: true } },
    },
  });

  const post = await prisma.post.findUnique({ where: { id: parsed.data.postId } });
  if (post && post.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: "COMMENT",
        content: `${session.user.id}|commented on your post`,
      },
    });
  }

  return NextResponse.json({ comment }, { status: 201 });
}
