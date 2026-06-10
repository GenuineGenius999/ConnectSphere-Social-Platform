"use client";

import { useEffect, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { toast } from "sonner";
import { formatRelativeTime } from "@/lib/utils";

type AdminPost = {
  id: string;
  content: string;
  image: string | null;
  createdAt: string;
  author: { id: string; name: string; username: string; avatar: string | null; isBanned: boolean };
  _count: { likes: number; comments: number };
};

export function PostsManagement() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    const res = await fetch("/api/admin/posts");
    const data = await res.json();
    if (res.ok) setPosts(data.posts);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const deletePost = async (postId: string) => {
    if (!confirm("Delete this post permanently?")) return;
    const res = await fetch("/api/admin/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    if (res.ok) {
      setPosts((p) => p.filter((x) => x.id !== postId));
      toast.success("Post deleted");
    } else {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <Card key={post.id} className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <UserAvatar src={post.author.avatar ?? `https://i.pravatar.cc/150?u=${post.author.username}`} alt={post.author.name} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{post.author.name}</p>
                  <span className="text-xs text-muted-foreground">@{post.author.username}</span>
                  {post.author.isBanned && <span className="text-xs text-destructive">BANNED</span>}
                </div>
                <p className="text-sm mt-1 line-clamp-3">{post.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatRelativeTime(new Date(post.createdAt))} · {post._count.likes} likes · {post._count.comments} comments
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => deletePost(post.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
