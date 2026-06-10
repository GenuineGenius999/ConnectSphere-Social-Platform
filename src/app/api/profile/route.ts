import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidProfileImageUrl } from "@/lib/media";

const mediaUrlSchema = z
  .string()
  .min(1)
  .refine((url) => isValidProfileImageUrl(url), "Invalid image URL")
  .optional()
  .nullable();

const profileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(500).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  website: z.string().max(200).optional().nullable(),
  avatar: mediaUrlSchema,
  coverImage: mediaUrlSchema,
  isPrivate: z.boolean().optional(),
  notifyLikes: z.boolean().optional(),
  notifyComments: z.boolean().optional(),
  notifyFollows: z.boolean().optional(),
  notifyMessages: z.boolean().optional(),
  notifyFriendReqs: z.boolean().optional(),
  showActivity: z.boolean().optional(),
  allowTagging: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      bio: true,
      avatar: true,
      coverImage: true,
      location: true,
      website: true,
      isPrivate: true,
      isVerified: true,
      notifyLikes: true,
      notifyComments: true,
      notifyFollows: true,
      notifyMessages: true,
      notifyFriendReqs: true,
      showActivity: true,
      allowTagging: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const data = parsed.data;

  if (data.username && data.username !== session.user.username) {
    const taken = await prisma.user.findUnique({ where: { username: data.username } });
    if (taken) return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      avatar: true,
      coverImage: true,
      location: true,
      website: true,
      isPrivate: true,
      notifyLikes: true,
      notifyComments: true,
      notifyFollows: true,
      notifyMessages: true,
      notifyFriendReqs: true,
      showActivity: true,
      allowTagging: true,
    },
  });

  return NextResponse.json({ user });
}
