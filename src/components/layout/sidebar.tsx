"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Users,
  MessageCircle,
  Bell,
  Bookmark,
  Calendar,
  ShoppingBag,
  Clapperboard,
  Tv,
  Gamepad2,
  Settings,
  Radio,
  Megaphone,
  Sparkles,
  Heart,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useSession } from "next-auth/react";
import { AdminLink } from "@/components/layout/admin-link";
import { useRealtime } from "@/components/providers/realtime-provider";

function useMainNav() {
  const realtime = useRealtime();
  return [
    { href: "/feed", label: "Home", icon: Home },
    { href: "/explore", label: "Explore", icon: Compass },
    { href: "/friends", label: "Friends", icon: Users, badge: realtime.pendingFriendRequests || undefined },
    { href: "/messages", label: "Messages", icon: MessageCircle, badge: realtime.unreadMessages || undefined },
    { href: "/notifications", label: "Notifications", icon: Bell, badge: realtime.unreadNotifications || undefined },
  ];
}

const discoverNav = [
  { href: "/reels", label: "Reels", icon: Clapperboard },
  { href: "/watch", label: "Watch", icon: Tv },
  { href: "/live", label: "Live", icon: Radio },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/pages", label: "Pages", icon: Sparkles },
  { href: "/gaming", label: "Gaming", icon: Gamepad2 },
];

const personalNav = [
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/memories", label: "Memories", icon: Clock },
  { href: "/ads", label: "Ads Manager", icon: Megaphone },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavItem({
  href,
  label,
  icon: Icon,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
      <span className="flex-1">{label}</span>
      {badge && badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const { data: session } = useSession();
  const user = session?.user;
  const mainNav = useMainNav();

  return (
    <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col border-r border-border/60 bg-card/50 backdrop-blur-xl h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
          <Heart className="h-5 w-5 text-white fill-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          ConnectSphere
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-6 pb-4">
        <div className="space-y-1">
          {mainNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>

        <div>
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Discover
          </p>
          <div className="space-y-1">
            {discoverNav.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Personal
          </p>
          <div className="space-y-1">
            {personalNav.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
            <AdminLink />
          </div>
        </div>
      </nav>

      {user && (
        <Link
          href={`/profile/${user.username}`}
          className="flex items-center gap-3 border-t border-border/60 p-4 hover:bg-muted/50 transition-colors"
        >
          <UserAvatar
            src={user.image ?? `https://i.pravatar.cc/150?u=${user.username}`}
            alt={user.name ?? "User"}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </Link>
      )}
    </aside>
  );
}
