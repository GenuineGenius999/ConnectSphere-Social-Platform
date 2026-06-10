"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PostComments } from "@/components/feed/post-comments";
import { ReportDialog } from "@/components/shared/report-dialog";

interface PostCardProps {
  post: {
    id: string;
    author: {
      name: string;
      username: string;
      avatar: string;
      isVerified?: boolean;
    };
    content: string;
    image: string | null;
    video?: string | null;
    likes: number;
    comments: number;
    shares: number;
    createdAt: Date;
    liked?: boolean;
    saved?: boolean;
    location?: string | null;
  };
}

export function PostCard({ post }: PostCardProps) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(post.liked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [saved, setSaved] = useState(post.saved ?? false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments);

  const toggleLike = async () => {
    if (!session) {
      toast.error("Sign in to like posts");
      return;
    }

    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLiked(data.liked);
      setLikeCount(data.likes);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error("Failed to update like");
    }
  };

  const sharePost = async () => {
    const url = `${window.location.origin}/feed?post=${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${post.author.name} on ConnectSphere`, text: post.content.slice(0, 100), url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Post link copied to clipboard");
      }
    } catch {
      await navigator.clipboard.writeText(url).catch(() => null);
      toast.success("Post link copied to clipboard");
    }
  };

  const copyPostLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/feed?post=${post.id}`);
    toast.success("Link copied");
  };

  return (
    <Card className="overflow-hidden border-border/40">
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author.username}`}>
            <UserAvatar src={post.author.avatar} alt={post.author.name} size="md" isVerified={post.author.isVerified} />
          </Link>
          <div>
            <Link href={`/profile/${post.author.username}`} className="font-semibold text-sm hover:underline">
              {post.author.name}
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{formatRelativeTime(new Date(post.createdAt))}</span>
              {post.location && (
                <>
                  <span>·</span>
                  <MapPin className="h-3 w-3" />
                  <span>{post.location}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ReportDialog type="POST" targetId={post.id} label="Report" />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyPostLink} title="Copy link">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 pb-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {post.image && (
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={post.image}
            alt="Post image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
            unoptimized={post.image.startsWith("/uploads/")}
          />
        </div>
      )}

      {post.video && (
        <div className="px-0">
          <video src={post.video} controls className="w-full max-h-[480px] bg-black" />
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        <span>{formatNumber(likeCount)} likes</span>
        <div className="flex gap-3">
          <span>{formatNumber(commentCount)} comments</span>
          <span>{formatNumber(post.shares)} shares</span>
        </div>
      </div>

      <div className="flex items-center border-t border-border/40 mx-4">
        <Button variant="ghost" className={cn("flex-1 rounded-none h-11", liked && "text-red-500 hover:text-red-600")} onClick={toggleLike}>
          <Heart className={cn("h-4 w-4 mr-2", liked && "fill-current")} />
          Like
        </Button>
        <Button variant="ghost" className="flex-1 rounded-none h-11" onClick={() => setShowComments(!showComments)}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Comment
        </Button>
        <Button variant="ghost" className="flex-1 rounded-none h-11" onClick={sharePost}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-11 w-11", saved && "text-primary")}
          onClick={async () => {
            if (!session) {
              toast.error("Sign in to save posts");
              return;
            }
            const prev = saved;
            setSaved(!saved);
            try {
              const res = await fetch(`/api/posts/${post.id}/save`, { method: "POST" });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              setSaved(data.saved);
              toast.success(data.saved ? "Post saved" : "Removed from saved");
            } catch {
              setSaved(prev);
              toast.error("Failed to save post");
            }
          }}
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
        </Button>
      </div>
      <PostComments
        postId={post.id}
        open={showComments}
        onCommentAdded={() => setCommentCount((c) => c + 1)}
      />
    </Card>
  );
}
