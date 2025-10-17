interface HeaderProps {
  onSignOut: () => void;
}

export function Header({ onSignOut }: HeaderProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-normal">One Inbox</h1>
        <div className="flex items-center gap-4">
          <a
            href="/integrations"
            className="text-sm text-gray-600 hover:text-black"
          >
            Integrations
          </a>
          <button
            onClick={onSignOut}
            className="text-sm text-gray-600 hover:text-black"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
