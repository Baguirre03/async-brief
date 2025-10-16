import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchGitHubNotifications } from "@/lib/integrations/github";
import { fetchGmailMessages } from "@/lib/integrations/gmail";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [githubResult, gmailResult] = await Promise.allSettled([
      fetchGitHubNotifications(session.user.id),
      fetchGmailMessages(session.user.id),
    ]);

    const allMessages = [];

    if (githubResult.status === "fulfilled") {
      allMessages.push(...githubResult.value);
    } else {
      console.error("GitHub fetch failed:", githubResult.reason);
    }

    // Add Gmail messages if successful
    if (gmailResult.status === "fulfilled") {
      allMessages.push(...gmailResult.value);
    } else {
      console.error("Gmail fetch failed:", gmailResult.reason);
    }

    // Sort by recievedAt desc
    const sortedMessages = allMessages.sort((a, b) => {
      const ta = a.recievedAt ? new Date(a.recievedAt).getTime() : 0;
      const tb = b.recievedAt ? new Date(b.recievedAt).getTime() : 0;
      return tb - ta;
    });

    return NextResponse.json({
      success: true,
      count: sortedMessages.length,
      messages: sortedMessages,
      providers: {
        github: githubResult.status === "fulfilled",
        gmail: gmailResult.status === "fulfilled",
      },
    });
  } catch (error) {
    console.error("Combined fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
