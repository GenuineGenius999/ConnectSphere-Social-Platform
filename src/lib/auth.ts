import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/permissions";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await compare(password, user.password);
        if (!valid) return null;

        if (user.isBanned) {
          throw new Error("Your account has been banned. Contact support.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          role: user.role,
          username: user.username,
          canPost: user.canPost,
          canComment: user.canComment,
          canMessage: user.canMessage,
          canVoiceCall: user.canVoiceCall,
          canVideoCall: user.canVideoCall,
          canGoLive: user.canGoLive,
          canCreateGroups: user.canCreateGroups,
          canSellItems: user.canSellItems,
          isBanned: user.isBanned,
        };
      },
    }),
  ],
});

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !canAccessAdmin(session.user.role)) {
    return null;
  }
  return session;
}
