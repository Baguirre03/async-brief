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
    <div className="mb-4">
      {syncing ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-sm text-blue-800 dark:text-blue-200">
            Syncing Gmail...
          </span>
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2 flex items-center gap-2">
          <span className="text-green-600 dark:text-green-400">✓</span>
          <span className="text-sm text-green-800 dark:text-green-200">
            Messages synced
          </span>
        </div>
      )}
    </div>
  );
}
