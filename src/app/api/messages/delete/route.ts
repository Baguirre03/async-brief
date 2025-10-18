import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteGmailMessage } from "@/lib/integrations/gmail";

export async function DELETE(request: NextRequest) {
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

    // Handle different providers
    if (provider === "gmail") {
      await deleteGmailMessage(session.user.id, messageId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
