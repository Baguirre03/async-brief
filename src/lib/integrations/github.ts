import { prisma } from "@/lib/prisma";

export interface GitHubNotification {
  id: string;
  unread: boolean;
  reason: string;
  updated_at: string; // ISO
  repository: {
    full_name: string;
    html_url?: string;
  };
  subject: {
    title: string;
    url: string; // API URL
    latest_comment_url?: string;
    type: string;
  };
}

export interface GitHubMessage {
  id: string;
  externalId: string;
  provider: "github";
  title: string | null;
  content: string | null;
  sender: string | null;
  url: string | null;
  recievedAt: Date;
  priority: string;
  status: string;
  tags: string[];
}

export async function fetchGitHubNotifications(
  userId: string
): Promise<GitHubMessage[]> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "github",
    },
  });

  if (!account || !account.access_token) {
    return [];
  }

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  // TODO: CHANGE PARAMS WHEN PUSHED TO PROD
  const params = new URLSearchParams({
    all: "true", // include read notifications
    per_page: "50",
    // since: threeDaysAgo.toISOString(),
  });

  const response = await fetch(
    `https://api.github.com/notifications?${params.toString()}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${account.access_token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("GitHub notifications error:", response.status, text);
    return [];
  }

  const notifications = (await response.json()) as GitHubNotification[];

  const mapped = notifications.map((n) => {
    const repoName = n.repository.full_name;
    const webUrl = n.repository.html_url
      ? n.repository.html_url
      : `https://github.com/${repoName}`;

    return {
      id: `gh_${n.id}`,
      externalId: n.id,
      provider: "github",
      title: n.subject.title,
      content: `${n.subject.type} • ${repoName} • ${n.reason}`,
      sender: repoName,
      url: webUrl,
      recievedAt: new Date(n.updated_at),
      priority: "medium", // TODO: Add priority based on notification type
      status: n.unread ? "unread" : "read",
      tags: [n.subject.type.toLowerCase()],
    } as GitHubMessage;
  });

  return mapped;
}
