import { createCalendarClient } from "../clients/google-calendar-client";
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
  const calendar = await createCalendarClient(userId);

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const calendarsResponse = await calendar.calendarList.list();
    const calendars = calendarsResponse.data.items || [];

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
        calendarId: event.calendarId,
        calendarName: event.calendarName,
        calendarColor: event.calendarColor,
      };
    });

    return parsedEvents;
  } catch (error) {
    console.error("Error fetching calendar events:", error);
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
