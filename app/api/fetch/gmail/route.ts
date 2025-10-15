import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchGmailMessages } from "@/lib/integrations/gmail";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await fetchGmailMessages(session.user.id);

    return NextResponse.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Gmail fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Gmail messages" },
      { status: 500 }
    );
  }
}
