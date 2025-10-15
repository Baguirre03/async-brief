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
      const response = await fetch("/api/messages");
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

    // Listen for refresh events from FetchGmailButton
    const handleRefresh = () => {
      fetchMessages();
    };

    window.addEventListener("refreshMessages", handleRefresh);
    return () => {
      window.removeEventListener("refreshMessages", handleRefresh);
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unread":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "read":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "archived":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center text-gray-600 dark:text-gray-400">
          Loading messages...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            No messages yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Click &ldquo;Fetch Gmail&rdquo; to sync your messages
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Messages
        </h2>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {message.title || "No Subject"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  From: {message.sender || "Unknown"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                    message.priority
                  )}`}
                >
                  {message.priority}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    message.status
                  )}`}
                >
                  {message.status}
                </span>
              </div>
            </div>

            {message.content && (
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                {message.content}
              </p>
            )}

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {message.tags && message.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {message.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {message.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{message.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {message.recievedAt && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(message.recievedAt).toLocaleDateString()}
                  </span>
                )}
                {message.url && (
                  <a
                    href={message.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
