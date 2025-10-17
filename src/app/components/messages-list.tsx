"use client";

import { useState } from "react";
import { ChevronDown, RotateCcw, GitBranch, Mail } from "lucide-react";
import { useAllMessagesOptimized } from "@/lib/hooks/use-messages";
import { GmailPopup } from "@/app/components/gmail-popup";

export function MessagesList() {
  const {
    isLoading,
    isError,
    error,
    refetch,
    markAsRead,
    unreadMessages,
    readMessages,
  } = useAllMessagesOptimized();
  const [isUnreadCollapsed, setIsUnreadCollapsed] = useState(false);
  const [isReadCollapsed, setIsReadCollapsed] = useState(false);
  const [popupMessage, setPopupMessage] = useState<{
    id: string;
    url: string;
    messageData: {
      title?: string | null;
      content?: string | null;
      sender?: string | null;
      recievedAt?: Date | string;
    };
  } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b border-gray-200 px-4 py-3">
            <div className="flex items-baseline gap-4">
              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
              </div>
              <div className="w-16 h-3 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">
        {error instanceof Error ? error.message : "Failed to load messages"}
      </div>
    );
  }

  if (unreadMessages.length === 0 && readMessages.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">No messages</div>
    );
  }

  return (
    <div>
      {/* Header with refresh button */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-700">
          Messages ({unreadMessages.length} unread, {readMessages.length} read)
        </h2>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50 flex items-center gap-1"
        >
          <RotateCcw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Unread Messages Section */}
      {unreadMessages.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                Unread ({unreadMessages.length})
              </h3>
              <button
                onClick={() => setIsUnreadCollapsed(!isUnreadCollapsed)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    isUnreadCollapsed ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>
          {!isUnreadCollapsed &&
            unreadMessages.map((message) => (
              <div
                key={message.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer bg-blue-25"
                onClick={() => {
                  if (message.provider === "gmail") {
                    markAsRead(
                      message.id,
                      message.url || "#",
                      message.provider,
                      false
                    );
                    setPopupMessage({
                      id: message.id,
                      url: message.url || "#",
                      messageData: {
                        title: message.title,
                        content: message.content,
                        sender: message.sender,
                        recievedAt: message.recievedAt,
                      },
                    });
                  } else {
                    markAsRead(
                      message.id,
                      message.url || "#",
                      message.provider
                    );
                  }
                }}
              >
                <div className="block px-4 py-3">
                  <div className="flex items-baseline gap-4">
                    <div className="w-48 flex-shrink-0 truncate text-sm flex items-center gap-2">
                      {renderProviderIcon(message.provider)}
                      {message.sender || "Unknown"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold">
                        {message.title || "(no subject)"}
                      </span>
                      {message.preview && (
                        <span className="text-sm text-gray-600 ml-2">
                          - {message.preview}
                        </span>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-500">
                      {message.recievedAt &&
                        formatDate(new Date(message.recievedAt))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Read Messages Section */}
      {readMessages.length > 0 && (
        <div>
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Read ({readMessages.length})
              </h3>
              <button
                onClick={() => setIsReadCollapsed(!isReadCollapsed)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${
                    isReadCollapsed ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>
          {!isReadCollapsed &&
            readMessages.map((message) => (
              <div
                key={message.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  if (message.provider === "gmail") {
                    setPopupMessage({
                      id: message.id,
                      url: message.url || "#",
                      messageData: {
                        title: message.title,
                        content: message.content,
                        sender: message.sender,
                        recievedAt: message.recievedAt,
                      },
                    });
                  } else {
                    window.open(
                      message.url || "#",
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }
                }}
              >
                <div className="block px-4 py-3">
                  <div className="flex items-baseline gap-4">
                    <div className="w-48 flex-shrink-0 truncate text-sm flex items-center gap-2 text-gray-600">
                      {renderProviderIcon(message.provider)}
                      {message.sender || "Unknown"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-normal text-gray-700">
                        {message.title || "(no subject)"}
                      </span>
                      {message.preview && (
                        <span className="text-sm text-gray-500 ml-2">
                          - {message.preview}
                        </span>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-400">
                      {message.recievedAt &&
                        formatDate(new Date(message.recievedAt))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Gmail Popup */}
      <GmailPopup
        isOpen={popupMessage !== null}
        onClose={() => {
          setPopupMessage(null);
        }}
        messageUrl={popupMessage?.url || ""}
        messageData={popupMessage?.messageData}
      />
    </div>
  );
}

function renderProviderIcon(provider?: string) {
  const common = "w-3 h-3 text-gray-600";
  if (provider === "github") {
    return <GitBranch className={common} />;
  }
  return <Mail className={common} />;
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
