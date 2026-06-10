import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageReports } from "@/lib/permissions";

const schema = z.object({
  status: z.enum(["PENDING", "REVIEWING", "RESOLVED", "DISMISSED"]),
  adminNote: z.string().max(2000).optional(),
  action: z.enum(["none", "ban_user", "delete_post", "delete_comment"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !canManageReports(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const { status, adminNote, action } = parsed.data;

  if (action === "ban_user" && report.type === "USER") {
    await prisma.user.update({ where: { id: report.targetId }, data: { isBanned: true } });
  }
  if (action === "delete_post" && report.type === "POST") {
    await prisma.post.delete({ where: { id: report.targetId } }).catch(() => null);
  }
  if (action === "delete_comment" && report.type === "COMMENT") {
    await prisma.comment.delete({ where: { id: report.targetId } }).catch(() => null);
  }

  const updated = await prisma.report.update({
    where: { id },
    data: {
      status,
      adminNote: adminNote ?? report.adminNote,
      reviewerId: session.user.id,
    },
    include: {
      reporter: { select: { name: true, username: true } },
      reviewer: { select: { name: true, username: true } },
    },
  });

  return NextResponse.json({ report: updated });
}
