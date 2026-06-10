"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Ban, FileText, MessageCircle, Bell, ShoppingBag,
  Clapperboard, Calendar, UsersRound, Heart, Loader2, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PlatformData = {
  stats: Record<string, number>;
  usersByRole: { role: string; _count: { id: number } }[];
  recentUsers: { id: string; name: string; username: string; createdAt: string; role: string }[];
  recentPosts: { id: string; content: string; createdAt: string; author: { name: string; username: string } }[];
  timestamp: string;
};

const statConfig = [
  { key: "users", label: "Total Users", icon: Users, color: "text-primary" },
  { key: "bannedUsers", label: "Banned", icon: Ban, color: "text-destructive" },
  { key: "posts", label: "Posts", icon: FileText, color: "text-emerald-500" },
  { key: "comments", label: "Comments", icon: MessageCircle, color: "text-blue-500" },
  { key: "likes", label: "Likes", icon: Heart, color: "text-red-500" },
  { key: "messages", label: "Messages", icon: MessageCircle, color: "text-indigo-500" },
  { key: "notifications", label: "Notifications", icon: Bell, color: "text-amber-500" },
  { key: "groups", label: "Groups", icon: UsersRound, color: "text-cyan-500" },
  { key: "events", label: "Events", icon: Calendar, color: "text-orange-500" },
  { key: "marketplaceItems", label: "Marketplace", icon: ShoppingBag, color: "text-pink-500" },
  { key: "reels", label: "Reels", icon: Clapperboard, color: "text-violet-500" },
  { key: "follows", label: "Follows", icon: Users, color: "text-teal-500" },
  { key: "pages", label: "Pages", icon: FileText, color: "text-slate-500" },
  { key: "stories", label: "Stories", icon: Clapperboard, color: "text-fuchsia-500" },
  { key: "liveStreams", label: "Live Streams", icon: RefreshCw, color: "text-rose-500" },
  { key: "watchVideos", label: "Watch Videos", icon: Clapperboard, color: "text-sky-500" },
  { key: "games", label: "Games", icon: Heart, color: "text-lime-500" },
  { key: "pendingReports", label: "Pending Reports", icon: Bell, color: "text-orange-600" },
];

export function PlatformDashboard() {
  const [data, setData] = useState<PlatformData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/platform");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return <p className="text-destructive">Failed to load platform data</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Live · Updated {new Date(data.timestamp).toLocaleTimeString()} · refreshes every 10s
        </p>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statConfig.map((s) => (
          <Card key={s.key} className="border-border/40">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{(data.stats[s.key] ?? 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/40">
          <CardHeader><CardTitle className="text-base">Users by Role</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.usersByRole.map((r) => (
              <Badge key={r.role} variant="secondary" className="py-1.5 px-3">
                {r.role}: {r._count.id}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader><CardTitle className="text-base">Quick Links</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm"><Link href="/admin/users">Users</Link></Button>
            <Button asChild variant="outline" size="sm"><Link href="/admin/posts">Posts</Link></Button>
            <Button asChild variant="outline" size="sm"><Link href="/admin/users?filter=banned">Banned</Link></Button>
            <Button asChild variant="outline" size="sm"><Link href="/feed">Open App</Link></Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/40">
          <CardHeader><CardTitle className="text-base">Recent Users</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">@{u.username}</p>
                </div>
                <Badge variant="outline">{u.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader><CardTitle className="text-base">Recent Posts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.recentPosts.map((p) => (
              <div key={p.id} className="text-sm border-b border-border/40 pb-2 last:border-0">
                <p className="font-medium">{p.author.name}</p>
                <p className="text-muted-foreground line-clamp-2">{p.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
