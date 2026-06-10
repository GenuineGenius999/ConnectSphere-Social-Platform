"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImageIcon, MapPin, Loader2, X, Video, Paperclip } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/shared/user-avatar";
import { toast } from "sonner";

type MediaPreview = {
  url: string;
  kind: "image" | "video" | "file";
  mimeType: string;
  name?: string;
};

export function CreatePost() {
  const { data: session } = useSession();
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [media, setMedia] = useState<MediaPreview | null>(null);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  if (!session?.user) return null;

  const canPost = session.user.canPost && !session.user.isBanned;

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      setMedia({
        url: data.url,
        kind: data.kind ?? (file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "file"),
        mimeType: data.mimeType ?? file.type,
        name: file.name,
      });

      const storageLabel = data.storage === "postimages" ? "Postimages" : "your device storage";
      toast.success(`Uploaded to ${storageLabel}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Write something to post");
      return;
    }

    setPosting(true);
    try {
      const postContent =
        media?.kind === "file"
          ? `${content.trim()}\n\n📎 ${media.name}: ${window.location.origin}${media.url}`
          : content.trim();

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: postContent,
          image: media?.kind === "image" ? media.url : null,
          video: media?.kind === "video" ? media.url : null,
          location: location.trim() || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Failed to post");

      setContent("");
      setMedia(null);
      setLocation("");
      setShowLocation(false);
      toast.success("Post published!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className="p-4 border-border/40">
      <div className="flex gap-3">
        <UserAvatar
          src={session.user.image ?? `https://i.pravatar.cc/150?u=${session.user.username}`}
          alt={session.user.name ?? "You"}
          size="md"
        />
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder={`What's on your mind, ${session.user.name?.split(" ")[0]}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            disabled={!canPost}
            className="resize-none border-0 bg-muted/60 focus-visible:ring-1"
          />

          {media?.kind === "image" && (
            <div className="relative rounded-xl overflow-hidden aspect-video">
              <Image src={media.url} alt="Upload preview" fill sizes="600px" className="object-cover" unoptimized={media.url.startsWith("/uploads/")} />
              <button type="button" onClick={() => setMedia(null)} className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {media?.kind === "video" && (
            <div className="relative rounded-xl overflow-hidden">
              <video src={media.url} controls className="w-full max-h-80 rounded-xl bg-black" />
              <button type="button" onClick={() => setMedia(null)} className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {media?.kind === "file" && (
            <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3 text-sm">
              <span className="truncate">📎 {media.name}</span>
              <button type="button" onClick={() => setMedia(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {showLocation && (
            <Input placeholder="Add location..." value={location} onChange={(e) => setLocation(e.target.value)} className="text-sm" />
          )}
        </div>
      </div>

      <input ref={imageRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }} />
      <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }} />
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.mp3,.wav" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }} />

      <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
        <div className="flex gap-1 flex-wrap">
          <Button variant="ghost" size="sm" disabled={!canPost || uploading} onClick={() => imageRef.current?.click()} className="text-muted-foreground hover:text-primary">
            {uploading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-1.5 text-emerald-500" />}
            Photo
          </Button>
          <Button variant="ghost" size="sm" disabled={!canPost || uploading} onClick={() => videoRef.current?.click()} className="text-muted-foreground hover:text-primary">
            <Video className="h-4 w-4 mr-1.5 text-violet-500" />
            Video
          </Button>
          <Button variant="ghost" size="sm" disabled={!canPost || uploading} onClick={() => fileRef.current?.click()} className="text-muted-foreground hover:text-primary">
            <Paperclip className="h-4 w-4 mr-1.5 text-amber-500" />
            File
          </Button>
          <Button variant="ghost" size="sm" disabled={!canPost} onClick={() => setShowLocation(!showLocation)} className="text-muted-foreground hover:text-primary">
            <MapPin className="h-4 w-4 mr-1.5 text-red-500" />
            Location
          </Button>
        </div>
        <Button size="sm" onClick={handleSubmit} disabled={!canPost || posting || uploading}>
          {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
        </Button>
      </div>

      {!canPost && (
        <p className="text-xs text-destructive mt-2">You don&apos;t have permission to create posts.</p>
      )}
    </Card>
  );
}
