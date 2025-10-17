"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";

export interface Message {
  id: string;
  externalId: string;
  provider: string;
  title: string | null;
  content: string | null;
  preview: string | null;
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

async function markMessageAsRead(
  messageId: string,
  provider: string
): Promise<void> {
  const response = await fetch("/api/messages/mark-read", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messageId, provider }),
  });

  if (!response.ok) {
    throw new Error("Failed to mark message as read");
  }
}

export function useAllMessagesOptimized() {
  const queryClient = useQueryClient();
  const [readMessageIds, setReadMessageIds] = useState<Set<string>>(new Set());

  const query = useQuery({
    queryKey: ["messages", "all"],
    queryFn: fetchAllMessages,
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache time - keeps data in cache longer
    refetchOnWindowFocus: true,
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Only refetch when network reconnects
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for better real-time sync
    refetchIntervalInBackground: false, // Don't refetch when tab is hidden
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("4")) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({
      messageId,
      provider,
    }: {
      messageId: string;
      provider: string;
    }) => markMessageAsRead(messageId, provider),
    onMutate: ({ messageId }) => {
      setReadMessageIds((prev) => new Set([...prev, messageId]));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", "all"] });
    },
    onError: (error, { messageId }) => {
      console.error("Error marking message as read:", error);
      setReadMessageIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    },
  });

  const markAsRead = useCallback(
    (
      messageId: string,
      url: string,
      provider: string,
      openUrl: boolean = true
    ) => {
      if (openUrl) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      markAsReadMutation.mutate({ messageId, provider });
    },
    [markAsReadMutation]
  );

  // Transform messages to include locally marked as read
  const messages =
    query.data?.messages?.map((message) => ({
      ...message,
      status: readMessageIds.has(message.id) ? "read" : message.status,
    })) || [];

  // Separate messages into read and unread
  const unreadMessages = messages.filter((msg) => msg.status === "unread");
  const readMessages = messages.filter((msg) => msg.status === "read");

  return {
    // Original query properties
    ...query,
    // Transformed data
    data: query.data
      ? {
          ...query.data,
          messages,
        }
      : undefined,
    // State management functions
    markAsRead,
    // Mutation state
    isMarkingAsRead: markAsReadMutation.isPending,
    markAsReadError: markAsReadMutation.error,
    // Computed values
    unreadMessages,
    readMessages,
  };
}
