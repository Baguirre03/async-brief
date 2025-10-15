import { auth, signIn, signOut } from "@/lib/auth";
import { FetchGmailButton } from "@/components/fetch-gmail-button";
import { MessagesList } from "@/components/messages-list";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Async Briefing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your personal email assistant
            </p>
          </div>

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
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Gmail Integration
                  </h3>
                  <FetchGmailButton />
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

          {/* Messages List */}
          {session?.user && (
            <div className="mb-8">
              <MessagesList />
            </div>
          )}

          {/* Feature Preview */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Gmail Sync
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Automatically fetch and process your Gmail messages
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                AI Summaries
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Get intelligent briefings of your important emails
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-3">⏰</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                Stay Organized
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Never miss important messages with smart notifications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
