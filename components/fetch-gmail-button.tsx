"use client";

import { useState } from "react";

export function FetchGmailButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFetch = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/fetch/gmail", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Fetched ${data.count} messages!`);
        // Trigger a custom event to refresh the messages list
        window.dispatchEvent(new CustomEvent("refreshMessages"));
      } else {
        setMessage("Error fetching messages");
      }
    } catch (error) {
      setMessage("Error fetching messages");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {message && <span className="text-sm text-gray-600">{message}</span>}
      <button
        onClick={handleFetch}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Fetching..." : "Fetch Gmail"}
      </button>
    </div>
  );
}
