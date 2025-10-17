import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: string;
  }>;
  isAllDay: boolean;
  status: string;
  htmlLink?: string;
  // Calendar info
  calendarId?: string;
  calendarName?: string;
  calendarColor?: string;
}

interface GoogleCalendarMessage {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: string;
  }>;
  isAllDay: boolean;
  status: string;
  htmlLink?: string;
  calendarId?: string;
  calendarName?: string;
  calendarColor?: string;
}

/**
 * Fetch Google Calendar events for a user for today from ALL calendars
 * @param userId - The ID of the user
 * @param date - The date to fetch events for (defaults to today)
 * @returns The fetched calendar events from all calendars
 */
export async function fetchGoogleCalendarEvents(
  userId: string,
  date: Date = new Date()
): Promise<CalendarEvent[]> {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
  });

  if (!account || !account.access_token) {
    throw new Error("No Google account connected");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
  });

  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date
            ? Math.floor(tokens.expiry_date / 1000)
            : null,
        },
      });
    }
  });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // Get start and end of the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    // First, get list of all calendars
    const calendarsResponse = await calendar.calendarList.list();
    const calendars = calendarsResponse.data.items || [];

    // Fetch events from ALL calendars
    const allEventsPromises = calendars.map(async (cal) => {
      try {
        const response = await calendar.events.list({
          calendarId: cal.id!,
          timeMin: startOfDay.toISOString(),
          timeMax: endOfDay.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
        });

        const events = response.data.items || [];

        // Return events with calendar info
        return events.map((event) => ({
          ...event,
          calendarId: cal.id || undefined,
          calendarName: cal.summary || cal.id || "Unknown Calendar",
          calendarColor: cal.backgroundColor || "#4285f4",
        }));
      } catch (error) {
        console.warn(`Failed to fetch events from calendar ${cal.id}:`, error);
        return [];
      }
    });

    const allEventsArrays = await Promise.all(allEventsPromises);
    const allEvents = allEventsArrays.flat();

    // Sort all events by start time
    allEvents.sort((a, b) => {
      const timeA = a.start?.dateTime || a.start?.date || "";
      const timeB = b.start?.dateTime || b.start?.date || "";
      return timeA.localeCompare(timeB);
    });

    const parsedEvents: CalendarEvent[] = allEvents.map((event) => {
      const start = event.start?.dateTime
        ? new Date(event.start.dateTime)
        : event.start?.date
        ? new Date(event.start.date + "T00:00:00")
        : new Date();

      const end = event.end?.dateTime
        ? new Date(event.end.dateTime)
        : event.end?.date
        ? new Date(event.end.date + "T23:59:59")
        : new Date();

      const isAllDay = !event.start?.dateTime && !!event.start?.date;

      return {
        id: event.id || "",
        title: event.summary || "No Title",
        start,
        end,
        description: event.description || undefined,
        location: event.location || undefined,
        attendees:
          event.attendees?.map((attendee) => ({
            email: attendee.email || "",
            displayName: attendee.displayName || undefined,
            responseStatus: attendee.responseStatus || "needsAction",
          })) || [],
        isAllDay,
        status: event.status || "confirmed",
        htmlLink: event.htmlLink || undefined,
        // Add calendar info
        calendarId: event.calendarId,
        calendarName: event.calendarName,
        calendarColor: event.calendarColor,
      } satisfies GoogleCalendarMessage;
    });

    return parsedEvents;
  } catch (error) {
    console.error("Error fetching calendar events:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("insufficient authentication scopes")) {
        throw new Error(
          "Calendar access not granted. Please reconnect your Google account to enable calendar access."
        );
      }
      if (error.message.includes("403")) {
        throw new Error(
          "Calendar access denied. Please check your Google account permissions."
        );
      }
    }

    throw new Error("Failed to fetch calendar events");
  }
}

/**
 * Get a summary of today's calendar events
 * @param userId - The ID of the user
 * @returns Summary object with event counts and next event
 */
export async function getCalendarSummary(userId: string) {
  const events = await fetchGoogleCalendarEvents(userId);
  const now = new Date();

  const upcomingEvents = events.filter((event) => event.start > now);
  const currentEvents = events.filter(
    (event) => event.start <= now && event.end >= now
  );

  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

  return {
    totalEvents: events.length,
    upcomingEvents: upcomingEvents.length,
    currentEvents: currentEvents.length,
    nextEvent,
    events,
  };
}
