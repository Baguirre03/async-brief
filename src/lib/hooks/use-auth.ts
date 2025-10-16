"use client";

import { useSession } from "next-auth/react";
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
    hasProvider: (_provider: "google" | "github") => {
      if (!session?.user?.id) return false;
      // This would need to be enhanced to check actual connected providers
      // For now, we'll assume both are available if authenticated
      return isAuthenticated;
    },
  };
}
