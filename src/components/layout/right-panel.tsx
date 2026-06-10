import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getSuggestedUsers } from "@/lib/queries/users";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function RightPanel() {
  const session = await auth();
  const suggestedUsers = await getSuggestedUsers(4, session?.user?.id);

  const trendingPosts = await prisma.post.groupBy({
    by: ["content"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });

  const trendingTopics = trendingPosts.map((p, i) => ({
    id: String(i + 1),
    tag: `#${p.content.split(" ")[0]?.replace(/[^a-zA-Z]/g, "") || "Trending"}`,
    posts: p._count.id * 1000,
  }));

  return (
    <aside className="hidden xl:block w-80 space-y-4 sticky top-20 h-fit">
      {trendingTopics.length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Trending Now</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingTopics.map((topic) => (
              <Link
                key={topic.id}
                href={`/search?q=${encodeURIComponent(topic.tag)}`}
                className="block rounded-lg p-2 -mx-2 hover:bg-muted/50 transition-colors"
              >
                <p className="font-semibold text-sm text-primary">{topic.tag}</p>
                <p className="text-xs text-muted-foreground">{topic.posts.toLocaleString()} posts</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Suggested for You</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Link href={`/profile/${user.username}`}>
                <UserAvatar src={user.avatar} alt={user.name} size="sm" isVerified={user.isVerified} />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${user.username}`} className="block">
                  <p className="text-sm font-semibold truncate hover:underline">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                </Link>
              </div>
              <Button size="sm" variant="outline" className="shrink-0 h-8 text-xs">
                <UserPlus className="h-3 w-3 mr-1" />
                Follow
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <footer className="text-xs text-muted-foreground space-x-2 px-2">
        <Link href="/about" className="hover:underline">About</Link>
        <span>·</span>
        <Link href="/help" className="hover:underline">Help</Link>
        <span>·</span>
        <Link href="/privacy" className="hover:underline">Privacy</Link>
        <p className="mt-2">© 2026 ConnectSphere</p>
      </footer>
    </aside>
  );
}
