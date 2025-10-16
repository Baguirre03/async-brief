import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  signInWithGoogle,
  signInWithGitHub,
  signOutUser,
  disconnectGitHub,
  disconnectGoogle,
} from "@/actions/auth";

export default async function IntegrationsPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-normal mb-4">Integrations</h1>
          <p className="text-sm text-gray-600 mb-8">
            Please sign in to manage your integrations
          </p>
          <Link
            href="/"
            className="border border-black px-6 py-2 text-sm hover:bg-black hover:text-white transition-colors inline-block"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Get user's accounts from the database

  const accounts = await prisma.account.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      provider: true,
      providerAccountId: true,
    },
  });

  const connectedProviders = new Set(
    accounts.map((account) => account.provider)
  );
  const hasGoogle = connectedProviders.has("google");
  const hasGitHub = connectedProviders.has("github");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-normal hover:text-gray-600">
              ← Inbox
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.user.email}</span>
            <form action={signOutUser}>
              <button
                type="submit"
                className="text-sm text-gray-600 hover:text-black"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-normal mb-2">Integrations</h1>
        <p className="text-sm text-gray-600 mb-8">
          Connect your accounts to sync messages and data
        </p>

        <div className="space-y-4">
          {/* Google Integration */}
          <div className="border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-normal mb-1">Google</h2>
                <p className="text-sm text-gray-600">
                  Access Gmail and Google Calendar
                </p>
              </div>
              <div>
                {hasGoogle ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Connected</span>
                    <form action={disconnectGoogle}>
                      <button
                        type="submit"
                        className="text-sm text-gray-600 hover:text-black cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </form>
                  </div>
                ) : (
                  <form action={signInWithGoogle}>
                    <button
                      type="submit"
                      className="border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition-colors"
                    >
                      Connect
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* GitHub Integration */}
          <div className="border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-normal mb-1">GitHub</h2>
                <p className="text-sm text-gray-600">
                  Access repositories and notifications
                </p>
              </div>
              <div>
                {hasGitHub ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Connected</span>
                    <form action={disconnectGitHub}>
                      <button
                        type="submit"
                        className="text-sm text-gray-600 hover:text-black cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </form>
                  </div>
                ) : (
                  <form action={signInWithGitHub}>
                    <button
                      type="submit"
                      className="border border-black px-4 py-2 text-sm hover:bg-black hover:text-white transition-colors"
                    >
                      Connect
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
