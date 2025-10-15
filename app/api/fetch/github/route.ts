import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchGitHubNotifications } from "@/lib/integrations/github";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await fetchGitHubNotifications(session.user.id);

    return NextResponse.json({
      success: true,
      count: notifications.length,
      messages: notifications,
    });
  } catch (error) {
    console.error("GitHub fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub notifications" },
      { status: 500 }
    );
  }
}
