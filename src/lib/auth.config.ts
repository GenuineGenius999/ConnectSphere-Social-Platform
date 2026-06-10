import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no Prisma / database imports).
 * Used by middleware. Full providers live in auth.ts.
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.username = user.username;
        if (user.image) token.picture = user.image;
        token.canPost = user.canPost;
        token.canComment = user.canComment;
        token.canMessage = user.canMessage;
        token.canVoiceCall = user.canVoiceCall;
        token.canVideoCall = user.canVideoCall;
        token.canGoLive = user.canGoLive;
        token.canCreateGroups = user.canCreateGroups;
        token.canSellItems = user.canSellItems;
        token.isBanned = user.isBanned;
      }

      if (trigger === "update" && session?.user) {
        if (session.user.name) token.name = session.user.name;
        if (session.user.image !== undefined) token.picture = session.user.image;
        const updatedUsername = (session.user as { username?: string }).username;
        if (updatedUsername) token.username = updatedUsername;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        if (token.picture) session.user.image = token.picture as string;
        session.user.canPost = token.canPost;
        session.user.canComment = token.canComment;
        session.user.canMessage = token.canMessage;
        session.user.canVoiceCall = token.canVoiceCall;
        session.user.canVideoCall = token.canVideoCall;
        session.user.canGoLive = token.canGoLive;
        session.user.canCreateGroups = token.canCreateGroups;
        session.user.canSellItems = token.canSellItems;
        session.user.isBanned = token.isBanned;
      }
      return session;
    },
  },
};
