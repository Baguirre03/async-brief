"use client";

import { useEffect } from "react";
import { useAllMessages } from "@/lib/hooks/use-messages";

export function MessagesList() {
  const { messages, isLoading, isError, error, refetch } = useAllMessages();

  useEffect(() => {
    const handleRefresh = () => {
      refetch();
    };

    window.addEventListener("refreshMessages", handleRefresh);
    return () => {
      window.removeEventListener("refreshMessages", handleRefresh);
    };
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">Loading...</div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">
        {error instanceof Error ? error.message : "Failed to load messages"}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">No messages</div>
    );
  }

  return (
    <div>
      {messages.map((message) => (
        <div
          key={message.id}
          className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <a
            href={message.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3"
          >
            <div className="flex items-baseline gap-4">
              <div className="w-48 flex-shrink-0 truncate text-sm flex items-center gap-2">
                {renderProviderIcon(message.provider)}
                {message.sender || "Unknown"}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm ${
                    message.status === "unread"
                      ? "font-semibold"
                      : "font-normal"
                  }`}
                >
                  {message.title || "(no subject)"}
                </span>
                {message.content && (
                  <span className="text-sm text-gray-600 ml-2">
                    - {message.content.substring(0, 100)}
                  </span>
                )}
              </div>
              <div className="flex-shrink-0 text-xs text-gray-500">
                {message.recievedAt && formatDate(new Date(message.recievedAt))}
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}

function renderProviderIcon(provider?: string) {
  const common = "w-3 h-3 text-gray-600";
  if (provider === "github") {
    // Git branching icon (minimal mono)
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={common}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="6" cy="4" r="2" />
        <circle cx="6" cy="20" r="2" />
        <circle cx="18" cy="12" r="2" />
        <path d="M8 5v14" />
        <path d="M8 6c8 0 8 6 8 6" />
      </svg>
    );
  }
  // Default to mail icon (Gmail or unknown)
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={common}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}
