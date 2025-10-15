import { auth } from "@/lib/auth";
import { signInWithGoogle, signOutUser } from "@/actions/auth";
import { MessagesList } from "@/components/messages-list";
import { AutoSyncGmail } from "@/components/auto-sync-gmail";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-normal mb-8">Async Briefing</h1>
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="border border-black px-6 py-2 text-sm hover:bg-black hover:text-white transition-colors"
            >
              Sign in with Google
            </button>
          </form>
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
      <div className="max-w-6xl mx-auto">
        <AutoSyncGmail />
        <MessagesList />
      </div>
    </div>
  );
}
