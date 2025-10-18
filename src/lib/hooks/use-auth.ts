"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  signInWithGoogle,
  signInWithGitHub,
  signOutUser,
} from "@/actions/auth";

export function useAuth() {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;
  const user = session?.user;

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch("/api/user/accounts");
      if (!response.ok) return [];
      const data = await response.json();
      return data.accounts || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const signIn = {
    google: async () => {
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error("Google sign-in error:", error);
        throw error;
      }
    },
    github: async () => {
      try {
        await signInWithGitHub();
      } catch (error) {
        console.error("GitHub sign-in error:", error);
        throw error;
      }
    },
  };

  const signOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Sign-out error:", error);
      throw error;
    }
  };

  return {
    // Session state
    user,
    session,
    isLoading,
    isAuthenticated,

    // Actions
    signIn,
    signOut,

    // Utilities
    hasProvider: (provider: "google" | "github") => {
      if (!session?.user?.id) return false;
      return accounts.some(
        (account: { provider: string }) => account.provider === provider
      );
    },
    accounts,
  };
}
