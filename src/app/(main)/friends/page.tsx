import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/shared/user-avatar";
import { auth } from "@/lib/auth";
import { getFriends, getFriendRequests } from "@/lib/queries/users";
import { FriendRequestActions } from "@/components/friends/friend-request-actions";

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [friends, friendRequests] = await Promise.all([
    getFriends(session.user.id),
    getFriendRequests(session.user.id),
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Friends</h1>
        <p className="text-muted-foreground">Manage your connections</p>
      </div>

      <Input placeholder="Search friends..." className="max-w-md" />

      {friendRequests.length > 0 && (
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-base">Friend Requests</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friendRequests.map((req) => (
              <div key={req.id} className="rounded-xl border border-border/60 p-4 text-center">
                <Link href={`/profile/${req.user.username}`}>
                  <UserAvatar src={req.user.avatar} alt={req.user.name} size="lg" className="mx-auto" />
                </Link>
                <Link href={`/profile/${req.user.username}`}>
                  <p className="font-semibold mt-3 hover:underline">{req.user.name}</p>
                </Link>
                <p className="text-xs text-muted-foreground">{req.mutualFriends} mutual friends</p>
                <FriendRequestActions requestId={req.id} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">All Friends ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="text-muted-foreground">No friends yet. Connect with people on ConnectSphere!</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((friend) => (
              <Card key={friend.id} className="border-border/40 hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <Link href={`/profile/${friend.username}`}>
                    <UserAvatar src={friend.avatar} alt={friend.name} size="md" isVerified={friend.isVerified} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${friend.username}`}>
                      <p className="font-semibold text-sm truncate hover:underline">{friend.name}</p>
                    </Link>
                    <p className="text-xs text-muted-foreground">@{friend.username}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <UserPlus className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
