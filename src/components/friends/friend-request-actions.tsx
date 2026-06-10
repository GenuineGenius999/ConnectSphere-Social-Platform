"use client";

import { useRouter } from "next/navigation";
import { UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function FriendRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();

  const handle = async (action: "accept" | "decline") => {
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    });
    if (res.ok) {
      toast.success(action === "accept" ? "Friend request accepted" : "Request declined");
      router.refresh();
    } else {
      toast.error("Failed to update request");
    }
  };

  return (
    <div className="flex gap-2 mt-3">
      <Button size="sm" className="flex-1" onClick={() => handle("accept")}>
        <UserCheck className="h-3 w-3 mr-1" /> Accept
      </Button>
      <Button size="sm" variant="outline" className="flex-1" onClick={() => handle("decline")}>
        <UserX className="h-3 w-3 mr-1" /> Decline
      </Button>
    </div>
  );
}
