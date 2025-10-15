import { auth, signIn, signOut } from "@/lib/auth";
import { MessagesList } from "@/components/messages-list";
import { AutoSyncGmail } from "@/components/auto-sync-gmail";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Auth Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            {session?.user ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Welcome back, {session.user.name}!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <div className="border-t dark:border-gray-700 pt-6">
                  <form
                    action={async () => {
                      "use server";
                      await signOut();
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-lg bg-gray-600 px-6 py-2 font-semibold text-white hover:bg-gray-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                    Get Started
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sign in with Google to access your Gmail and create
                    briefings
                  </p>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await signIn("google");
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Sign in with Google
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Auto-sync and Messages List */}
          {session?.user && (
            <div className="mb-8">
              <AutoSyncGmail />
              <MessagesList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
