import Image from "next/image";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getSavedPosts } from "@/lib/queries/social";
import { formatRelativeTime } from "@/lib/utils";

export default async function SavedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const savedPosts = await getSavedPosts(session.user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Saved</h1>
        <p className="text-muted-foreground">Posts you&apos;ve bookmarked</p>
      </div>

      {savedPosts.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">No saved posts yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {savedPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden border-border/40 hover:shadow-md transition-shadow cursor-pointer">
              {post.image && (
                <div className="relative aspect-video bg-muted">
                  <Image src={post.image} alt="" fill sizes="400px" className="object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bookmark className="h-4 w-4 text-primary fill-primary" />
                  <span className="text-sm font-semibold">{post.author.name}</span>
                  <span className="text-xs text-muted-foreground">· {formatRelativeTime(post.createdAt)}</span>
                </div>
                <p className="text-sm line-clamp-3">{post.content}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
