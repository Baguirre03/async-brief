"use client";

import { useQuery } from "@tanstack/react-query";

export interface Message {
  id: string;
  externalId: string;
  provider: string;
  title: string | null;
  content: string | null;
  sender: string | null;
  url: string | null;
  recievedAt: Date | string;
  priority: string;
  status: string;
  tags: string[];
}

interface ApiResponse {
  success: boolean;
  count: number;
  messages: Message[];
  providers: {
    github: boolean;
    gmail: boolean;
  };
}

async function fetchAllMessages(): Promise<ApiResponse> {
  const response = await fetch("/api/fetch/all");

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch messages");
  }

  return response.json();
}

export function useAllMessagesOptimized() {
  return useQuery({
    queryKey: ["messages", "all"],
    queryFn: fetchAllMessages,
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache time - keeps data in cache longer
    refetchOnWindowFocus: false, // Don't refetch when user returns to tab
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Only refetch when network reconnects
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes in background
    refetchIntervalInBackground: false, // Don't refetch when tab is hidden
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("4")) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
