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
}

async function fetchMessages(endpoint: string): Promise<Message[]> {
  const response = await fetch(endpoint);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch from ${endpoint}`);
  }

  const data: ApiResponse = await response.json();

  if (!data.success) {
    throw new Error(`API returned unsuccessful response from ${endpoint}`);
  }

  return data.messages;
}

export function useGitHubMessages() {
  return useQuery({
    queryKey: ["messages", "github"],
    queryFn: () => fetchMessages("/api/fetch/github"),
    staleTime: 2 * 60 * 1000, // 2 minutes for GitHub notifications
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
  });
}

export function useGmailMessages() {
  return useQuery({
    queryKey: ["messages", "gmail"],
    queryFn: () => fetchMessages("/api/fetch/gmail"),
    staleTime: 5 * 60 * 1000, // 5 minutes for Gmail messages
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
  });
}

export function useAllMessages() {
  const githubQuery = useGitHubMessages();
  const gmailQuery = useGmailMessages();

  const isLoading = githubQuery.isLoading || gmailQuery.isLoading;
  const isError = githubQuery.isError || gmailQuery.isError;
  const error = githubQuery.error || gmailQuery.error;

  const messages: Message[] = [];

  if (githubQuery.data) {
    messages.push(...githubQuery.data);
  }

  if (gmailQuery.data) {
    messages.push(...gmailQuery.data);
  }

  // Sort by recievedAt desc
  const sortedMessages = messages.sort((a, b) => {
    const ta = a.recievedAt ? new Date(a.recievedAt).getTime() : 0;
    const tb = b.recievedAt ? new Date(b.recievedAt).getTime() : 0;
    return tb - ta;
  });

  const refetch = () => {
    githubQuery.refetch();
    gmailQuery.refetch();
  };

  return {
    messages: sortedMessages,
    isLoading,
    isError,
    error,
    refetch,
    // Individual query states for more granular control
    github: githubQuery,
    gmail: gmailQuery,
  };
}
