"use client";

import { useEffect, useState } from "react";

export function AutoSyncGmail() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const syncGmail = async () => {
      setSyncing(true);
      try {
        // Just trigger the messages list to refresh
        // It will fetch fresh data from Gmail
        window.dispatchEvent(new CustomEvent("refreshMessages"));
        setLastSync(new Date());
      } catch (error) {
        console.error("Auto-sync error:", error);
      } finally {
        setSyncing(false);
      }
    };

    syncGmail();
  }, []);

  if (!syncing && !lastSync) return null;

  return (
    <div className="border-b border-gray-200 px-4 py-2">
      {syncing ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin h-3 w-3 border border-black border-t-transparent rounded-full"></div>
          <span className="text-xs text-gray-600">Syncing...</span>
        </div>
      ) : (
        <div className="text-xs text-gray-600">
          Last synced: {lastSync?.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
