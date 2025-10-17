"use client";

import { LoadingPage } from "@/app/components/loading-page";
import { SignInPage } from "@/app/components/signin-page";
import { Header } from "@/app/components/header";
import { MainContent } from "@/app/components/main-content";
import { useAuth } from "@/lib/hooks/use-auth";

export function AuthGuard() {
  const { isLoading, isAuthenticated, signIn, signOut } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return (
      <SignInPage
        onGoogleSignIn={() => signIn.google()}
        onGitHubSignIn={() => signIn.github()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onSignOut={() => signOut()} />
      <MainContent />
    </div>
  );
}
