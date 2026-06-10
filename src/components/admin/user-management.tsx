"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Ban, CheckCircle, Loader2, Save, Shield } from "lucide-react";
import type { PlatformRole } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { UserAvatar } from "@/components/shared/user-avatar";
import { PERMISSION_LABELS, ROLE_LABELS, canManageRoles, type PermissionKey } from "@/lib/permissions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar: string | null;
  role: PlatformRole;
  isVerified: boolean;
  isBanned: boolean;
  canPost: boolean;
  canComment: boolean;
  canMessage: boolean;
  canVoiceCall: boolean;
  canVideoCall: boolean;
  canGoLive: boolean;
  canCreateGroups: boolean;
  canSellItems: boolean;
  createdAt: string;
};

const PERMISSION_KEYS = Object.keys(PERMISSION_LABELS) as PermissionKey[];

const ROLE_COLORS: Record<PlatformRole, string> = {
  USER: "bg-muted text-muted-foreground",
  MODERATOR: "bg-blue-500/10 text-blue-600",
  ADMIN: "bg-primary/10 text-primary",
  SUPER_ADMIN: "bg-accent/10 text-accent",
};

export function UserManagement() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<AdminUser>>>({});

  const actorCanManageRoles = session?.user?.role
    ? canManageRoles(session.user.role)
    : false;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      let list: AdminUser[] = data.users;
      if (filter === "banned") list = list.filter((u) => u.isBanned);
      setUsers(list);
    } catch {
      toast.error("Failed to load users. Make sure the database is set up.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getDraft = (user: AdminUser): AdminUser => ({
    ...user,
    ...drafts[user.id],
  });

  const updateDraft = (userId: string, patch: Partial<AdminUser>) => {
    setDrafts((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], ...patch },
    }));
  };

  const saveUser = async (user: AdminUser) => {
    const draft = getDraft(user);
    setSavingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: draft.role,
          isBanned: draft.isBanned,
          isVerified: draft.isVerified,
          canPost: draft.canPost,
          canComment: draft.canComment,
          canMessage: draft.canMessage,
          canVoiceCall: draft.canVoiceCall,
          canVideoCall: draft.canVideoCall,
          canGoLive: draft.canGoLive,
          canCreateGroups: draft.canCreateGroups,
          canSellItems: draft.canSellItems,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...data.user } : u)));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[user.id];
        return next;
      });
      toast.success(`Updated ${user.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="border-border/40 p-8 text-center">
        <p className="text-muted-foreground">
          No users found. Run database migration and seed first.
        </p>
        <code className="block mt-2 text-xs text-primary">npm run db:migrate && npm run db:seed</code>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => {
        const draft = getDraft(user);
        const isExpanded = expandedId === user.id;
        const hasChanges = Boolean(drafts[user.id]);
        const isSelf = session?.user?.id === user.id;

        return (
          <Card key={user.id} className={cn("border-border/40 overflow-hidden", draft.isBanned && "border-destructive/30")}>
            <CardContent className="p-0">
              <button
                type="button"
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : user.id)}
                disabled={isSelf}
              >
                <UserAvatar src={user.avatar ?? `https://i.pravatar.cc/300?u=${user.username}`} alt={user.name} size="md" isVerified={user.isVerified} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{user.name}</p>
                    <Badge className={ROLE_COLORS[draft.role]}>{ROLE_LABELS[draft.role]}</Badge>
                    {draft.isBanned && (
                      <Badge variant="destructive" className="gap-1">
                        <Ban className="h-3 w-3" /> Banned
                      </Badge>
                    )}
                    {draft.isVerified && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{user.username} · {user.email}</p>
                </div>
                <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>

              {isExpanded && !isSelf && (
                <div className="border-t border-border/40 p-4 space-y-5 bg-muted/20">
                  {actorCanManageRoles && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Role</p>
                      <div className="flex flex-wrap gap-2">
                        {(["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"] as PlatformRole[]).map((role) => (
                          <Button
                            key={role}
                            size="sm"
                            variant={draft.role === role ? "default" : "outline"}
                            onClick={() => updateDraft(user.id, { role })}
                            disabled={role === "SUPER_ADMIN" && session?.user?.role !== "SUPER_ADMIN"}
                          >
                            {ROLE_LABELS[role]}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold mb-3">Account Status</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 cursor-pointer">
                        <span className="text-sm">Banned</span>
                        <Switch
                          checked={draft.isBanned}
                          onCheckedChange={(v) => updateDraft(user.id, { isBanned: v })}
                        />
                      </label>
                      <label className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 cursor-pointer">
                        <span className="text-sm">Verified Badge</span>
                        <Switch
                          checked={draft.isVerified}
                          onCheckedChange={(v) => updateDraft(user.id, { isVerified: v })}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-3">Permissions</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {PERMISSION_KEYS.map((key) => (
                        <label
                          key={key}
                          className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 cursor-pointer"
                        >
                          <span className="text-sm">{PERMISSION_LABELS[key]}</span>
                          <Switch
                            checked={draft[key]}
                            onCheckedChange={(v) => updateDraft(user.id, { [key]: v })}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => saveUser(user)}
                    disabled={!hasChanges || savingId === user.id}
                    className="w-full sm:w-auto"
                  >
                    {savingId === user.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}

              {isSelf && isExpanded && (
                <div className="border-t border-border/40 p-4 text-sm text-muted-foreground">
                  You cannot edit your own account from this panel.
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
