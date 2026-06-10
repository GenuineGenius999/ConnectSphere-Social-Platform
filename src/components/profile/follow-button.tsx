"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function FollowButton({ userId, username }: { userId: string; username: string }) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch(`/api/follow?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => setFollowing(d.following));
  }, [session, userId]);

  if (!session || session.user.username === username) return null;

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFollowing(data.following);
      toast.success(data.following ? `Following @${username}` : `Unfollowed @${username}`);
    } catch {
      toast.error("Failed to update follow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={toggle} disabled={loading} variant={following ? "outline" : "default"}>
      {following ? "Following" : "Follow"}
    </Button>
  );
}
