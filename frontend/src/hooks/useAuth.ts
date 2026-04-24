"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user
    ? {
        id: (session.user as Record<string, unknown>).id as string,
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
        role: ((session.user as Record<string, unknown>).role as string) ?? "user",
      }
    : null;

  return {
    user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    signIn,
    signOut: () => signOut({ callbackUrl: "/" }),
  };
}
