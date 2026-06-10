import type { PlatformRole } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role: PlatformRole;
    username: string;
    canPost: boolean;
    canComment: boolean;
    canMessage: boolean;
    canVoiceCall: boolean;
    canVideoCall: boolean;
    canGoLive: boolean;
    canCreateGroups: boolean;
    canSellItems: boolean;
    isBanned: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      role: PlatformRole;
      username: string;
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
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: PlatformRole;
    username: string;
    canPost: boolean;
    canComment: boolean;
    canMessage: boolean;
    canVoiceCall: boolean;
    canVideoCall: boolean;
    canGoLive: boolean;
    canCreateGroups: boolean;
    canSellItems: boolean;
    isBanned: boolean;
  }
}
