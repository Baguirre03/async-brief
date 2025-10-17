"use client";

import { MessagesList } from "@/app/components/messages-list";
import { GoogleCalendarBox } from "@/app/components/google-calendar-box";
import { useAuth } from "@/lib/hooks/use-auth";

export function AuthGuard() {
  const { isLoading, isAuthenticated, signIn, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-normal mb-8">Async Briefing</h1>
          <div className="space-y-3">
            <button
              onClick={() => signIn.google()}
              className="w-full border border-black px-6 py-2 text-sm hover:bg-black hover:text-white transition-colors"
            >
              Sign in with Google
            </button>
            <button
              onClick={() => signIn.github()}
              className="w-full border border-gray-300 px-6 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Sign in with GitHub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-normal">Inbox</h1>
          <div className="flex items-center gap-4">
            <a
              href="/integrations"
              className="text-sm text-gray-600 hover:text-black"
            >
              Integrations
            </a>
            <button
              onClick={() => signOut()}
              className="text-sm text-gray-600 hover:text-black"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <GoogleCalendarBox />
          </div>

          {/* Messages Section */}
          <div className="lg:col-span-2">
            <MessagesList />
          </div>
        </div>
      </div>
    </div>
  );
}
