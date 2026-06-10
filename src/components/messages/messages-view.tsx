"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Search, Phone, Video, MoreVertical, Send, ImageIcon, Smile,
  ArrowLeft, Plus, MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { CallOverlay } from "@/components/calls/call-overlay";
import { ReportDialog } from "@/components/shared/report-dialog";
import { formatRelativeTime, cn } from "@/lib/utils";
import { buildCallRoomId } from "@/lib/calls";
import { canUseMessaging, canUseVoiceCall, canUseVideoCall } from "@/lib/permissions";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type Conversation = {
  id: string;
  user: { name: string; username: string; avatar: string; isVerified?: boolean };
  lastMessage: string;
  time: Date;
  unread: number;
  online: boolean;
};

type Message = {
  id: string;
  senderId: string;
  content: string;
  image?: string | null;
  time: Date;
};

type Contact = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified: boolean;
};

type MessagesViewProps = {
  conversations: Conversation[];
  initialMessages: Message[];
  currentUserId: string;
  initialChatUserId?: string;
};

const EMOJIS = ["😀", "😂", "❤️", "👍", "🔥", "🎉", "😍", "🙏"];

export function MessagesView({
  conversations: initialConversations,
  initialMessages,
  currentUserId,
  initialChatUserId,
}: MessagesViewProps) {
  const { data: session } = useSession();
  const perms = session?.user;

  const [conversations, setConversations] = useState(initialConversations);
  const [activeChatId, setActiveChatId] = useState(initialChatUserId ?? "");
  const [messages, setMessages] = useState(initialMessages);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const [callState, setCallState] = useState<{
    mode: "voice" | "video";
    incoming?: boolean;
    offer?: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const callPollRef = useRef(new Date().toISOString());

  const activeChat = conversations.find((c) => c.id === activeChatId);

  const filteredConversations = conversations.filter(
    (c) =>
      c.user.name.toLowerCase().includes(search.toLowerCase()) ||
      c.user.username.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const canMessage = perms ? canUseMessaging(perms) : false;

  const openChat = (userId: string) => {
    setActiveChatId(userId);
    setMobileShowChat(true);
    if (!conversations.find((c) => c.id === userId)) {
      const contact = contacts.find((c) => c.id === userId);
      if (contact) {
        setConversations((prev) => [
          {
            id: contact.id,
            user: contact,
            lastMessage: "Start a conversation",
            time: new Date(),
            unread: 0,
            online: false,
          },
          ...prev,
        ]);
      }
    }
  };

  const loadMessages = useCallback(async (otherUserId: string) => {
    const res = await fetch(`/api/messages?otherUserId=${otherUserId}`);
    if (!res.ok) return;
    const data = await res.json();
    setMessages(
      (data.messages ?? []).map((m: Message) => ({
        ...m,
        time: new Date(m.time),
      }))
    );
  }, []);

  useEffect(() => {
    if (!activeChatId) return;
    loadMessages(activeChatId);
    const interval = setInterval(() => loadMessages(activeChatId), 5000);
    return () => clearInterval(interval);
  }, [activeChatId, loadMessages]);

  useEffect(() => {
    if (!canMessage) return;
    const pollCalls = setInterval(async () => {
      try {
        const res = await fetch(`/api/calls/signal?since=${encodeURIComponent(callPollRef.current)}`);
        const data = await res.json();
        callPollRef.current = new Date().toISOString();
        for (const sig of data.signals ?? []) {
          if (sig.signalType === "ring" && !callState) {
            const payload = JSON.parse(sig.payload);
            const fromConv = conversations.find((c) => c.id === sig.fromUserId);
            if (fromConv) {
              setActiveChatId(sig.fromUserId);
              setMobileShowChat(true);
              setCallState({ mode: payload.mode ?? "voice", incoming: true });
            }
          }
          if (sig.signalType === "offer" && callState?.incoming) {
            setCallState((c) => (c ? { ...c, offer: sig.payload } : c));
          }
        }
      } catch {
        // ignore
      }
    }, 2000);
    return () => clearInterval(pollCalls);
  }, [callState, canMessage, conversations]);

  const loadContacts = async () => {
    const res = await fetch("/api/messages/contacts");
    if (res.ok) {
      const data = await res.json();
      setContacts(data.contacts ?? []);
    }
    setShowNewChat(true);
  };

  const sendMessage = async (content: string, image?: string | null) => {
    if (!activeChat || (!content.trim() && !image)) return;
    if (!canMessage) {
      toast.error("You don't have permission to send messages");
      return;
    }

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: activeChat.id, content: content.trim(), image }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Failed to send message");
      return;
    }

    await loadMessages(activeChat.id);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? { ...c, lastMessage: content.trim() || "📷 Image", time: new Date() }
          : c
      )
    );
  };

  const handleSend = async () => {
    if (!message.trim() || !activeChat) return;
    const text = message.trim();
    setMessage("");
    await sendMessage(text);
  };

  const handleImageAttach = async (file: File) => {
    if (!activeChat || !canMessage) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await sendMessage(message.trim(), data.url);
      setMessage("");
      toast.success("Image sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const startCall = (mode: "voice" | "video") => {
    if (!activeChat || !perms) return;
    if (mode === "voice" && !canUseVoiceCall(perms)) {
      toast.error("Voice calls are disabled for your account");
      return;
    }
    if (mode === "video" && !canUseVideoCall(perms)) {
      toast.error("Video calls are disabled for your account");
      return;
    }
    buildCallRoomId(currentUserId, activeChat.id);
    setCallState({ mode, incoming: false });
  };

  const ChatPanel = activeChat ? (
    <div className={cn("flex flex-1 flex-col min-w-0", !mobileShowChat && "hidden md:flex")}>
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setMobileShowChat(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <UserAvatar src={activeChat.user.avatar} alt={activeChat.user.name} size="sm" />
          <div>
            <p className="font-semibold text-sm">{activeChat.user.name}</p>
            <p className="text-xs text-muted-foreground">@{activeChat.user.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => startCall("voice")} title="Voice call">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => startCall("video")} title="Video call">
            <Video className="h-4 w-4" />
          </Button>
          <ReportDialog type="USER" targetId={activeChat.id} label="Report" />
          <Button variant="ghost" size="icon" onClick={() => toast.info(`@${activeChat.user.username}`)}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No messages yet. Say hello to {activeChat.user.name}!
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm space-y-2", isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md")}>
                  {msg.image && (
                    <div className="relative w-48 h-32 rounded-lg overflow-hidden">
                      <Image src={msg.image} alt="Attachment" fill className="object-cover" unoptimized={msg.image.startsWith("/uploads/")} />
                    </div>
                  )}
                  {msg.content && <p className="break-words">{msg.content}</p>}
                  <p className={cn("text-[10px]", isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {formatRelativeTime(msg.time)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 sm:p-4 border-t border-border/60 bg-card/50">
        {!canMessage ? (
          <p className="text-sm text-destructive text-center py-2">Messaging is disabled for your account.</p>
        ) : (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageAttach(e.target.files[0])}
            />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" disabled={uploading} onClick={() => fileRef.current?.click()}>
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setMessage((m) => m + EMOJIS[Math.floor(Math.random() * EMOJIS.length)])}>
                <Smile className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="flex-1"
              />
              <Button size="icon" disabled={uploading} onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  ) : (
    <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
      <div className="text-center space-y-2">
        <MessageSquare className="h-12 w-12 mx-auto opacity-40" />
        <p>Select a conversation or start a new message</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] min-h-[500px] rounded-2xl border border-border/60 overflow-hidden animate-fade-in">
        <div className={cn("w-full md:w-80 border-r border-border/60 flex flex-col bg-card/50 shrink-0", mobileShowChat && "hidden md:flex")}>
          <div className="p-4 border-b border-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Messages</h2>
              <Button size="sm" variant="outline" onClick={loadContacts}>
                <Plus className="h-4 w-4 mr-1" /> New
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9 bg-muted/50" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center space-y-3">
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <Button size="sm" onClick={loadContacts}>Start a conversation</Button>
              </div>
            ) : (
              filteredConversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => openChat(chat.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left",
                    activeChat?.id === chat.id && "bg-primary/5"
                  )}
                >
                  <UserAvatar src={chat.user.avatar} alt={chat.user.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm truncate">{chat.user.name}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{formatRelativeTime(chat.time)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {ChatPanel}
      </div>

      {showNewChat && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowNewChat(false)}>
          <div className="bg-card rounded-2xl border border-border/60 w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border/60">
              <h3 className="font-bold">New Message</h3>
              <Input placeholder="Search people..." className="mt-2" value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {contacts
                .filter((c) => c.name.toLowerCase().includes(contactSearch.toLowerCase()) || c.username.toLowerCase().includes(contactSearch.toLowerCase()))
                .map((c) => (
                  <button
                    key={c.id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 text-left"
                    onClick={() => { openChat(c.id); setShowNewChat(false); }}
                  >
                    <UserAvatar src={c.avatar} alt={c.name} size="sm" isVerified={c.isVerified} />
                    <div>
                      <p className="font-medium text-sm">{c.name}</p>
                      <p className="text-xs text-muted-foreground">@{c.username}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {callState && activeChat && (
        <CallOverlay
          currentUserId={currentUserId}
          peer={{ ...activeChat.user, id: activeChat.id }}
          mode={callState.mode}
          incoming={callState.incoming}
          incomingOffer={callState.offer}
          onClose={() => setCallState(null)}
        />
      )}
    </>
  );
}
