import { NextResponse } from "next/server";
import { PlatformRole } from "@prisma/client";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageRoles } from "@/lib/permissions";

const updateSchema = z.object({
  role: z.enum(["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"]).optional(),
  isBanned: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  canPost: z.boolean().optional(),
  canComment: z.boolean().optional(),
  canMessage: z.boolean().optional(),
  canVoiceCall: z.boolean().optional(),
  canVideoCall: z.boolean().optional(),
  canGoLive: z.boolean().optional(),
  canCreateGroups: z.boolean().optional(),
  canSellItems: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot modify your own account here" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const target = await prisma.user.findUnique({ where: { id } });

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (data.role && !canManageRoles(session.user.role)) {
      return NextResponse.json(
        { error: "Only Super Admin can change user roles" },
        { status: 403 }
      );
    }

    if (
      data.role &&
      data.role === "SUPER_ADMIN" &&
      session.user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Cannot assign Super Admin role" }, { status: 403 });
    }

    if (target.role === "SUPER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Cannot modify Super Admin accounts" }, { status: 403 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.role !== undefined && { role: data.role as PlatformRole }),
        ...(data.isBanned !== undefined && { isBanned: data.isBanned }),
        ...(data.isVerified !== undefined && { isVerified: data.isVerified }),
        ...(data.canPost !== undefined && { canPost: data.canPost }),
        ...(data.canComment !== undefined && { canComment: data.canComment }),
        ...(data.canMessage !== undefined && { canMessage: data.canMessage }),
        ...(data.canVoiceCall !== undefined && { canVoiceCall: data.canVoiceCall }),
        ...(data.canVideoCall !== undefined && { canVideoCall: data.canVideoCall }),
        ...(data.canGoLive !== undefined && { canGoLive: data.canGoLive }),
        ...(data.canCreateGroups !== undefined && { canCreateGroups: data.canCreateGroups }),
        ...(data.canSellItems !== undefined && { canSellItems: data.canSellItems }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        isBanned: true,
        isVerified: true,
        canPost: true,
        canComment: true,
        canMessage: true,
        canVoiceCall: true,
        canVideoCall: true,
        canGoLive: true,
        canCreateGroups: true,
        canSellItems: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Admin update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
