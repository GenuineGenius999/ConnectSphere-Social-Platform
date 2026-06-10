import { redirect } from "next/navigation";
import Image from "next/image";
import { Megaphone, TrendingUp, Users, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getUserAdsStats } from "@/lib/queries/ads";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";

export default async function AdsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const stats = await getUserAdsStats(session.user.id);

  const recentPosts = await prisma.post.findMany({
    where: { authorId: session.user.id },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { likes: true, comments: true } } },
  });

  const statCards = [
    { label: "Estimated Reach", value: formatNumber(stats.reach), icon: Users },
    { label: "Impressions", value: formatNumber(stats.impressions), icon: TrendingUp },
    { label: "Engagement", value: formatNumber(stats.engagement), icon: Heart },
    { label: "Active Campaigns", value: String(stats.activeCampaigns), icon: Megaphone },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Ads Manager</h1>
          <p className="text-muted-foreground">
            Performance based on your real posts, followers, and engagement
          </p>
        </div>
        <Button>Create Campaign</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-border/40">
            <CardContent className="p-4">
              <stat.icon className="h-5 w-5 text-primary" />
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/40 overflow-hidden">
        <div className="relative h-48">
          <Image
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=300&fit=crop"
            alt="Ads"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-accent/80 flex items-center p-8">
            <div className="text-white">
              <h2 className="text-2xl font-bold">Grow Your Audience</h2>
              <p className="mt-2 text-white/80 max-w-md">
                You have {formatNumber(stats.followers)} followers and {stats.posts} posts driving your reach on ConnectSphere.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-base">Your Post Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Create posts to see campaign-style performance here.</p>
          ) : (
            recentPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="font-semibold text-sm line-clamp-1">{post.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(post._count.likes)} likes · {formatNumber(post._count.comments)} comments
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 shrink-0">
                  Active
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
