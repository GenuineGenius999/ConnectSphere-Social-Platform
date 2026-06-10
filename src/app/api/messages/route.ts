import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidMediaUrl } from "@/lib/media";

const schema = z.object({
  receiverId: z.string(),
  content: z.string().max(5000).optional().default(""),
  image: z.string().min(1).optional().nullable(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const otherUserId = new URL(req.url).searchParams.get("otherUserId");
  if (!otherUserId) return NextResponse.json({ error: "otherUserId required" }, { status: 400 });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: session.user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, senderId: true, content: true, image: true, createdAt: true },
  });

  await prisma.message.updateMany({
    where: { senderId: otherUserId, receiverId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      content: m.content,
      image: m.image,
      time: m.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.canMessage) return NextResponse.json({ error: "No permission to message" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { receiverId, content, image } = parsed.data;

  if (!content.trim() && !image) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  if (image && !isValidMediaUrl(image)) {
    return NextResponse.json({ error: "Invalid attachment URL" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      senderId: session.user.id,
      receiverId,
      content: content.trim() || (image ? "Sent an attachment" : ""),
      image: image ?? null,
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
