"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/shared/user-avatar";
import { ReportDialog } from "@/components/shared/report-dialog";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; username: string; avatar: string | null; isVerified: boolean };
};

export function PostComments({
  postId,
  open,
  onCommentAdded,
}: {
  postId: string;
  open: boolean;
  onCommentAdded?: () => void;
}) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const canComment = session?.user?.canComment && !session?.user?.isBanned;

  useEffect(() => {
    if (!open) return;
    fetch(`/api/comments?postId=${postId}`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []));
  }, [postId, open]);

  const submit = async () => {
    if (!text.trim() || !session) return;
    if (!canComment) {
      toast.error("You don't have permission to comment");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComments((c) => [...c, data.comment]);
      setText("");
      onCommentAdded?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to comment");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="border-t border-border/40 px-4 py-3 space-y-3">
      {comments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first!</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} className="flex gap-2 group">
            <UserAvatar src={c.author.avatar ?? `https://i.pravatar.cc/150?u=${c.author.username}`} alt={c.author.name} size="xs" />
            <div className="flex-1 bg-muted/60 rounded-xl px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold">{c.author.name}</p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ReportDialog type="COMMENT" targetId={c.id} label="Report" />
                </div>
              </div>
              <p className="text-sm">{c.content}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{formatRelativeTime(new Date(c.createdAt))}</p>
            </div>
          </div>
        ))
      )}
      {session ? (
        canComment ? (
          <div className="flex gap-2">
            <Input
              placeholder="Write a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="flex-1 h-9"
            />
            <Button size="icon" className="h-9 w-9" onClick={submit} disabled={loading || !text.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-destructive">Commenting is disabled for your account.</p>
        )
      ) : (
        <p className="text-xs text-muted-foreground text-center">Sign in to comment</p>
      )}
    </div>
  );
}
