"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type RealtimeState = {
  unreadNotifications: number;
  unreadMessages: number;
  pendingFriendRequests: number;
  lastUpdate: string | null;
};

const RealtimeContext = createContext<RealtimeState>({
  unreadNotifications: 0,
  unreadMessages: 0,
  pendingFriendRequests: 0,
  lastUpdate: null,
});

export function useRealtime() {
  return useContext(RealtimeContext);
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [state, setState] = useState<RealtimeState>({
    unreadNotifications: 0,
    unreadMessages: 0,
    pendingFriendRequests: 0,
    lastUpdate: null,
  });

  const poll = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/realtime");
      if (!res.ok) return;
      const data = await res.json();
      setState((prev) => {
        const hasNew =
          data.unreadNotifications !== prev.unreadNotifications ||
          data.unreadMessages !== prev.unreadMessages;
        if (hasNew && data.newPosts > 0) {
          router.refresh();
        }
        return {
          unreadNotifications: data.unreadNotifications,
          unreadMessages: data.unreadMessages,
          pendingFriendRequests: data.pendingFriendRequests,
          lastUpdate: data.timestamp,
        };
      });
    } catch {
      // silent
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [status, poll]);

  return (
    <RealtimeContext.Provider value={state}>{children}</RealtimeContext.Provider>
  );
}
