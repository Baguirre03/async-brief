"use client";

import { useEffect, useState } from "react";

interface Message {
  id: string;
  title: string | null;
  content: string | null;
  sender: string | null;
  priority: string;
  status: string;
  recievedAt: string | null;
  url: string | null;
  tags: string[];
}

export function MessagesList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/fetch/gmail");
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
      } else {
        setError("Failed to load messages");
      }
    } catch (err) {
      setError("Failed to load messages");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const handleRefresh = () => {
      fetchMessages();
    };

    window.addEventListener("refreshMessages", handleRefresh);
    return () => {
      window.removeEventListener("refreshMessages", handleRefresh);
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-sm text-gray-500">{error}</div>
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
              <div className="w-48 flex-shrink-0 truncate text-sm">
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
