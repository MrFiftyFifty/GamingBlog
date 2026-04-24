import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
          const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
          const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          if (!res.ok) return null;
          const data = await res.json();
          return {
            id: data.user.id,
            name: data.user.username,
            email: data.user.email,
            image: data.user.avatar,
            role: data.user.role,
            accessToken: data.token,
          };
        } catch {
          return null;
        }
      },
    }),
    ...(process.env.STEAM_API_KEY
      ? [
          {
            id: "steam",
            name: "Steam",
            type: "oauth" as const,
            authorization: {
              url: "https://steamcommunity.com/openid/login",
              params: { scope: "" },
            },
            token: { url: "" },
            userinfo: { url: "" },
            clientId: process.env.STEAM_API_KEY,
            clientSecret: process.env.STEAM_API_KEY,
            profile(profile: Record<string, string>) {
              return { id: profile.steamid, name: profile.personaname, image: profile.avatarfull };
            },
          },
        ]
      : []),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as Record<string, unknown>).role ?? "user";
        token.accessToken = (user as unknown as Record<string, unknown>).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.sub;
        (session.user as Record<string, unknown>).role = token.role;
        (session.user as Record<string, unknown>).accessToken = token.accessToken;
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
