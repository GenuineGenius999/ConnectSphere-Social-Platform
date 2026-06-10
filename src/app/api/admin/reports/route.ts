import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageReports } from "@/lib/permissions";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !canManageReports(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const status = new URL(req.url).searchParams.get("status") ?? "PENDING";

  const reports = await prisma.report.findMany({
    where: status === "ALL" ? {} : { status: status as "PENDING" | "REVIEWING" | "RESOLVED" | "DISMISSED" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      reporter: { select: { id: true, name: true, username: true } },
      reviewer: { select: { id: true, name: true, username: true } },
    },
  });

  const counts = await prisma.report.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  return NextResponse.json({ reports, counts });
}
