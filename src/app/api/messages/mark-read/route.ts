import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markGmailMessageAsRead } from "@/lib/integrations/gmail";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, provider } = await request.json();

    if (!messageId || !provider) {
      return NextResponse.json(
        { error: "Message ID and provider are required" },
        { status: 400 }
      );
    }

    if (provider === "gmail") {
      await markGmailMessageAsRead(session.user.id, messageId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking message as read:", error);
    return NextResponse.json(
      { error: "Failed to mark message as read" },
      { status: 500 }
    );
  }
}
