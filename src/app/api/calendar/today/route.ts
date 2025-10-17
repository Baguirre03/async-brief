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

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("No Google account connected")) {
        return NextResponse.json(
          {
            success: false,
            error: "Google account not connected",
            code: "GOOGLE_NOT_CONNECTED",
          },
          { status: 400 }
        );
      }

      if (error.message.includes("Failed to fetch calendar events")) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to fetch calendar events",
            code: "CALENDAR_FETCH_FAILED",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
