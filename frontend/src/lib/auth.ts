import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

type BackendProfile = {
  id: number;
  email: string;
  username: string;
  avatar: string | null;
  bio: string;
  rating: number;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const tokenRes = await fetch(`${API_BASE}/api/token/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          if (!tokenRes.ok) return null;
          const { access, refresh } = (await tokenRes.json()) as {
            access: string;
            refresh: string;
          };

          const profileRes = await fetch(`${API_BASE}/api/profile/`, {
            headers: { Authorization: `Bearer ${access}` },
          });
          if (!profileRes.ok) return null;
          const profile = (await profileRes.json()) as BackendProfile;

          return {
            id: String(profile.id),
            name: profile.username,
            email: profile.email,
            image: profile.avatar,
            role: "user",
            accessToken: access,
            refreshToken: refresh,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as Record<string, unknown>;
        token.role = (u.role as string) ?? "user";
        token.accessToken = u.accessToken as string;
        token.refreshToken = u.refreshToken as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const s = session.user as Record<string, unknown>;
        s.id = token.sub;
        s.role = token.role;
        s.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    newUser: "/welcome",
    error: "/auth/login",
  },
};
