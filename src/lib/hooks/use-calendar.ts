import { useQuery } from "@tanstack/react-query";
import { CalendarEvent } from "@/lib/integrations/google-calendar";

interface CalendarSummary {
  totalEvents: number;
  upcomingEvents: number;
  currentEvents: number;
  nextEvent: CalendarEvent | null;
}

interface CalendarData {
  events: CalendarEvent[];
  summary: CalendarSummary;
}

async function fetchCalendarData(): Promise<CalendarData> {
  const response = await fetch("/api/calendar/today");
  console.log(response, "RESPONSE");

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch calendar data");
  }

  return {
    events: data.data?.events || [],
    summary: data.data?.summary || {
      totalEvents: 0,
      upcomingEvents: 0,
      currentEvents: 0,
      nextEvent: null,
    },
  };
}

export function useCalendar() {
  return useQuery({
    queryKey: ["calendar", "today"],
    queryFn: fetchCalendarData,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("401")) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}
