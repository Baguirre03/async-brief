import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCalendarSummary } from "@/lib/integrations/google-calendar";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const summary = await getCalendarSummary(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        events: summary.events,
        summary: {
          totalEvents: summary.totalEvents,
          upcomingEvents: summary.upcomingEvents,
          currentEvents: summary.currentEvents,
          nextEvent: summary.nextEvent,
        },
      },
    });
  } catch (error) {
    console.error("Calendar fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error Fetching Calendar",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
