"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Shield } from "lucide-react";
import { canAccessAdmin } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export function AdminLink({ className }: { className?: string }) {
  const { data: session } = useSession();

  if (!session?.user?.role || !canAccessAdmin(session.user.role)) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        className
      )}
    >
      <Shield className="h-5 w-5 shrink-0 text-primary" />
      <span>Admin Panel</span>
    </Link>
  );
}
