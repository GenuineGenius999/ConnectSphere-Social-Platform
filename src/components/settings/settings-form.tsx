"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Bell, Lock, Shield, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/shared/user-avatar";
import { toast } from "sonner";

type UserProfile = {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string | null;
  avatar: string | null;
  coverImage: string | null;
  location: string | null;
  website: string | null;
  isPrivate: boolean;
  notifyLikes: boolean;
  notifyComments: boolean;
  notifyFollows: boolean;
  notifyMessages: boolean;
  notifyFriendReqs: boolean;
  showActivity: boolean;
  allowTagging: boolean;
};

export function SettingsForm({ user }: { user: UserProfile }) {
  const { update } = useSession();
  const router = useRouter();
  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);

  const [form, setForm] = useState({
    name: user.name,
    username: user.username,
    bio: user.bio ?? "",
    location: user.location ?? "",
    website: user.website ?? "",
    avatar: user.avatar,
    coverImage: user.coverImage,
    isPrivate: user.isPrivate,
    notifyLikes: user.notifyLikes,
    notifyComments: user.notifyComments,
    notifyFollows: user.notifyFollows,
    notifyMessages: user.notifyMessages,
    notifyFriendReqs: user.notifyFriendReqs,
    showActivity: user.showActivity,
    allowTagging: user.allowTagging,
  });

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });

  const persistField = async (patch: Partial<typeof form>, successMsg: string) => {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Save failed");

    await update({
      user: {
        name: data.user.name,
        image: data.user.avatar ?? undefined,
        username: data.user.username,
      },
    });
    toast.success(successMsg);
    router.refresh();
    return data.user;
  };

  const uploadImage = async (file: File, field: "avatar" | "coverImage") => {
    setUploading(field === "avatar" ? "avatar" : "cover");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setForm((f) => ({ ...f, [field]: data.url }));

      await persistField(
        { [field]: data.url },
        field === "avatar" ? "Avatar updated" : "Cover photo updated"
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(null);
      if (field === "avatar" && avatarRef.current) avatarRef.current.value = "";
      if (field === "coverImage" && coverRef.current) coverRef.current.value = "";
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await persistField(form, "Profile saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwords.newPass !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Password updated");
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <Tabs defaultValue="profile">
      <TabsList className="w-full flex-wrap h-auto gap-1">
        <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /><span className="hidden sm:inline">Profile</span></TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /><span className="hidden sm:inline">Notifications</span></TabsTrigger>
        <TabsTrigger value="privacy" className="gap-2"><Shield className="h-4 w-4" /><span className="hidden sm:inline">Privacy</span></TabsTrigger>
        <TabsTrigger value="security" className="gap-2"><Lock className="h-4 w-4" /><span className="hidden sm:inline">Security</span></TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-4 mt-6">
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Images upload to Postimages; saved automatically when changed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <UserAvatar src={form.avatar ?? `https://i.pravatar.cc/150?u=${form.username}`} alt={form.name} size="xl" />
              <div className="space-y-2">
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "avatar")}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploading !== null}
                  onClick={() => avatarRef.current?.click()}
                >
                  {uploading === "avatar" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change Avatar"}
                </Button>
                <input
                  ref={coverRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], "coverImage")}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploading !== null}
                  onClick={() => coverRef.current?.click()}
                >
                  {uploading === "cover" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change Cover"}
                </Button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
            </div>
            <Button onClick={saveProfile} disabled={saving || uploading !== null}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="mt-6">
        <Card className="border-border/40">
          <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "notifyLikes" as const, label: "Likes on your posts" },
              { key: "notifyComments" as const, label: "Comments on your posts" },
              { key: "notifyFollows" as const, label: "New followers" },
              { key: "notifyMessages" as const, label: "New messages" },
              { key: "notifyFriendReqs" as const, label: "Friend requests" },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between py-2">
                <span className="text-sm">{item.label}</span>
                <Switch checked={form[item.key]} onCheckedChange={(v) => setForm({ ...form, [item.key]: v })} />
              </label>
            ))}
            <Button onClick={saveProfile} disabled={saving}>Save Preferences</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="privacy" className="mt-6">
        <Card className="border-border/40">
          <CardHeader><CardTitle>Privacy Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "isPrivate" as const, label: "Private account", desc: "Only approved followers see your posts" },
              { key: "showActivity" as const, label: "Show activity status", desc: "Let others see when you're active" },
              { key: "allowTagging" as const, label: "Allow tagging", desc: "Let others tag you in posts" },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={form[item.key]} onCheckedChange={(v) => setForm({ ...form, [item.key]: v })} />
              </label>
            ))}
            <Button onClick={saveProfile} disabled={saving}>Save Privacy</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="mt-6">
        <Card className="border-border/40">
          <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input type="password" placeholder="Current password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
            <Input type="password" placeholder="New password (min 8 chars)" value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} />
            <Input type="password" placeholder="Confirm new password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
            <Button onClick={changePassword}>Update Password</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
