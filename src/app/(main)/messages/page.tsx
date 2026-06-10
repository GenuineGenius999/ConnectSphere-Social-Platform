import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getConversations, getMessagesBetween } from "@/lib/queries/social";
import { MessagesView } from "@/components/messages/messages-view";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const conversations = await getConversations(session.user.id);
  const initialChatUserId = conversations[0]?.id;
  const messages = initialChatUserId
    ? await getMessagesBetween(session.user.id, initialChatUserId)
    : [];

  return (
    <div className="animate-fade-in">
      <MessagesView
        conversations={conversations}
        initialMessages={messages}
        currentUserId={session.user.id}
        initialChatUserId={initialChatUserId}
      />
    </div>
  );
}
