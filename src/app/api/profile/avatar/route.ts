import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidProfileImageUrl } from "@/lib/media";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { avatar, coverImage } = await req.json();

  if (avatar && !isValidProfileImageUrl(avatar)) {
    return NextResponse.json({ error: "Avatar URL is not valid" }, { status: 400 });
  }

  if (coverImage && !isValidProfileImageUrl(coverImage)) {
    return NextResponse.json({ error: "Cover URL is not valid" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(avatar !== undefined && { avatar }),
      ...(coverImage !== undefined && { coverImage }),
    },
    select: { avatar: true, coverImage: true },
  });

  return NextResponse.json({ user });
}
