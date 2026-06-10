"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Flag,
  ArrowLeft,
  LogOut,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ROLE_LABELS } from "@/lib/permissions";

const nav = [
  { href: "/admin", label: "Platform Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users & Permissions", icon: Users },
  { href: "/admin/posts", label: "Posts Moderation", icon: FileText },
  { href: "/admin/reports", label: "Reports", icon: Flag },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border/60 bg-card/50 h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border/60">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm">Admin Panel</p>
          <p className="text-[10px] text-muted-foreground">ConnectSphere</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {nav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border/60 space-y-2">
        {session?.user && (
          <div className="flex items-center gap-2 px-2 py-2">
            <UserAvatar
              src={session.user.image ?? "https://i.pravatar.cc/300?u=admin"}
              alt={session.user.name ?? "Admin"}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{session.user.name}</p>
              <p className="text-[10px] text-primary">{ROLE_LABELS[session.user.role]}</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
          <Link href="/feed">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to App
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}

export function AdminMobileHeader() {
  return (
    <header className="md:hidden flex items-center justify-between border-b border-border/60 px-4 py-3 bg-card/50">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-primary fill-primary" />
        <span className="font-bold">Admin</span>
      </div>
      <Button variant="outline" size="sm" asChild>
        <Link href="/feed">App</Link>
      </Button>
    </header>
  );
}
