import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      bio: true,
      avatar: true,
      coverImage: true,
      location: true,
      website: true,
      isPrivate: true,
      notifyLikes: true,
      notifyComments: true,
      notifyFollows: true,
      notifyMessages: true,
      notifyFriendReqs: true,
      showActivity: true,
      allowTagging: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>
      <SettingsForm user={user} />
    </div>
  );
}
