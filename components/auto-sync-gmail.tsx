"use client";

import { useEffect, useState } from "react";

export function AutoSyncGmail() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    let timeoutId: number | undefined;

    const jitterMs = (baseMs: number, varianceMs: number) => {
      const delta = Math.floor(Math.random() * varianceMs * 2) - varianceMs; // [-variance, +variance]
      return baseMs + delta;
    };

    const scheduleNext = () => {
      // Base 90s with ±15s jitter
      const delay = jitterMs(90_000, 15_000);
      timeoutId = window.setTimeout(runSyncIfVisible, delay);
    };

    const runSyncIfVisible = async () => {
      if (document.hidden) {
        // If tab hidden, reschedule without syncing
        scheduleNext();
        return;
      }
      setSyncing(true);
      try {
        window.dispatchEvent(new CustomEvent("refreshMessages"));
        setLastSync(new Date());
      } catch (error) {
        console.error("Auto-sync error:", error);
      } finally {
        setSyncing(false);
        scheduleNext();
      }
    };

    // Kick off immediately on mount
    runSyncIfVisible();

    const onVisibilityChange = () => {
      if (!document.hidden && timeoutId === undefined) {
        // If we were paused and come back, restart loop
        scheduleNext();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
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
