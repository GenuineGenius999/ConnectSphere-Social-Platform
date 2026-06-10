import type { PlatformRole } from "@prisma/client";

export const ADMIN_ROLES: PlatformRole[] = ["ADMIN", "SUPER_ADMIN", "MODERATOR"];

export function isAdminRole(role: PlatformRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export function canAccessAdmin(role: PlatformRole): boolean {
  return isAdminRole(role);
}

export function canManageRoles(actorRole: PlatformRole): boolean {
  return actorRole === "SUPER_ADMIN";
}

export function canManageReports(role: PlatformRole): boolean {
  return role === "MODERATOR" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export const PERMISSION_LABELS = {
  canPost: "Create Posts",
  canComment: "Comment on Posts",
  canMessage: "Send Messages",
  canVoiceCall: "Voice Calls",
  canVideoCall: "Video Calls & Screen Share",
  canGoLive: "Go Live",
  canCreateGroups: "Create Groups",
  canSellItems: "Sell on Marketplace",
} as const;

export type PermissionKey = keyof typeof PERMISSION_LABELS;

export const ROLE_LABELS: Record<PlatformRole, string> = {
  USER: "User",
  MODERATOR: "Moderator",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

export type SessionPermissions = {
  canPost: boolean;
  canComment: boolean;
  canMessage: boolean;
  canVoiceCall: boolean;
  canVideoCall: boolean;
  canGoLive: boolean;
  canCreateGroups: boolean;
  canSellItems: boolean;
  isBanned: boolean;
};

export function canUseMessaging(p: SessionPermissions): boolean {
  return p.canMessage && !p.isBanned;
}

export function canUseVoiceCall(p: SessionPermissions): boolean {
  return p.canMessage && p.canVoiceCall && !p.isBanned;
}

export function canUseVideoCall(p: SessionPermissions): boolean {
  return p.canMessage && p.canVideoCall && !p.isBanned;
}
