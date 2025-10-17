interface SignInPageProps {
  onGoogleSignIn: () => void;
  onGitHubSignIn: () => void;
}

export function SignInPage({
  onGoogleSignIn,
  onGitHubSignIn,
}: SignInPageProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-normal mb-8">Async Briefing</h1>
        <div className="space-y-3">
          <button
            onClick={onGoogleSignIn}
            className="w-full border border-black px-6 py-2 text-sm hover:bg-black hover:text-white transition-colors"
          >
            Sign in with Google
          </button>
          <button
            onClick={onGitHubSignIn}
            className="w-full border border-gray-300 px-6 py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}
