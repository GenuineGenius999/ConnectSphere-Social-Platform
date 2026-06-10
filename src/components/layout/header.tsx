"use client";

import Link from "next/link";
import { Search, Heart, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/60 bg-background/80 backdrop-blur-xl px-4 lg:px-6">
      <Link href="/feed" className="flex items-center gap-2 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
          <Heart className="h-4 w-4 text-white fill-white" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          ConnectSphere
        </span>
      </Link>

      <div className="relative flex-1 max-w-xl mx-auto">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search people, posts, groups..."
          className="pl-10 bg-muted/50 border-transparent focus:bg-background"
          readOnly
          onClick={() => (window.location.href = "/search")}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="lg:hidden" asChild>
          <Link href="/search">
            <Search className="h-5 w-5" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        {session?.user && (
          <Link href={`/profile/${session.user.username}`} className="hidden sm:block">
            <UserAvatar
              src={session.user.image ?? `https://i.pravatar.cc/150?u=${session.user.username}`}
              alt={session.user.name ?? "User"}
              size="sm"
            />
          </Link>
        )}
      </div>
    </header>
  );
}
