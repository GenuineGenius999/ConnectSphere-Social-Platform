import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, MessageCircle, UserPlus, AtSign, Calendar, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read";
import { UserAvatar } from "@/components/shared/user-avatar";
import { auth } from "@/lib/auth";
import { getNotifications } from "@/lib/queries/social";
import { formatRelativeTime, cn } from "@/lib/utils";

const iconMap = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  friend: Users,
  mention: AtSign,
  event: Calendar,
};

const colorMap = {
  like: "text-red-500 bg-red-500/10",
  comment: "text-blue-500 bg-blue-500/10",
  follow: "text-primary bg-primary/10",
  friend: "text-emerald-500 bg-emerald-500/10",
  mention: "text-amber-500 bg-amber-500/10",
  event: "text-purple-500 bg-purple-500/10",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await getNotifications(session.user.id);
  const unread = notifications.filter((n) => !n.isRead);

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm">{unread.length} unread</p>
        </div>
        <MarkAllReadButton disabled={unread.length === 0} />
      </div>

      {unread.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">New</h2>
          <Card className="divide-y divide-border/40 border-border/40 overflow-hidden">
            {unread.map((notif) => {
              const Icon = iconMap[notif.type as keyof typeof iconMap] ?? AtSign;
              return (
                <div key={notif.id} className="flex items-center gap-3 p-4 bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="relative">
                    <Link href={`/profile/${notif.user.username}`}>
                      <UserAvatar src={notif.user.avatar} alt={notif.user.name} size="md" />
                    </Link>
                    <div className={cn("absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full", colorMap[notif.type as keyof typeof colorMap])}>
                      <Icon className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <Link href={`/profile/${notif.user.username}`} className="font-semibold hover:underline">
                        {notif.user.name}
                      </Link>{" "}
                      {notif.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(notif.time)}</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                </div>
              );
            })}
          </Card>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-2">Earlier</h2>
        <Card className="divide-y divide-border/40 border-border/40 overflow-hidden">
          {notifications.filter((n) => n.isRead).map((notif) => {
            const Icon = iconMap[notif.type as keyof typeof iconMap] ?? AtSign;
            return (
              <div key={notif.id} className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                <div className="relative">
                  <Link href={`/profile/${notif.user.username}`}>
                    <UserAvatar src={notif.user.avatar} alt={notif.user.name} size="md" />
                  </Link>
                  <div className={cn("absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full", colorMap[notif.type as keyof typeof colorMap])}>
                    <Icon className="h-3 w-3" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <Link href={`/profile/${notif.user.username}`} className="font-semibold hover:underline">
                      {notif.user.name}
                    </Link>{" "}
                    {notif.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(notif.time)}</p>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
