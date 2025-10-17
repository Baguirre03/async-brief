"use client";

import { useCalendar } from "@/lib/hooks/use-calendar";
import { CalendarEvent } from "@/lib/integrations/google-calendar";

export function GoogleCalendarBox() {
  const { data, isLoading, error } = useCalendar();

  const events: CalendarEvent[] = data?.events || [];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  // Group events by hour for calendar view
  const eventsByHour = events.reduce((acc, event) => {
    const startDate = new Date(event.start);
    const hour = startDate.getHours();
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(event);
    return acc;
  }, {} as Record<number, CalendarEvent[]>);

  if (isLoading) {
    return (
      <div className="border border-gray-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <h3 className="font-medium">Today&apos;s Calendar</h3>
        </div>
        <div className="text-sm text-gray-500">Loading calendar events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-gray-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <h3 className="font-medium">Today&apos;s Calendar</h3>
        </div>
        <div className="text-sm text-red-500 mb-3">{error.message}</div>
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-4 bg-blue-500 rounded"></div>
        <h3 className="font-medium">Today&apos;s Calendar</h3>
        <span className="text-xs text-gray-500">({events.length} events)</span>
      </div>

      <div className="text-sm text-gray-600 mb-4">{formatDate(new Date())}</div>

      {events.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-8">
          No events scheduled for today
        </div>
      ) : (
        <div className="space-y-1 max-h-[600px] overflow-y-auto">
          {Object.keys(eventsByHour)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map((hour) => {
              const hourEvents = eventsByHour[parseInt(hour)];
              const displayHour = parseInt(hour);
              const timeLabel =
                displayHour === 0
                  ? "12 AM"
                  : displayHour < 12
                  ? `${displayHour} AM`
                  : displayHour === 12
                  ? "12 PM"
                  : `${displayHour - 12} PM`;

              return (
                <div
                  key={hour}
                  className="border-l-2 border-gray-200 pl-3 pb-2"
                >
                  <div className="text-xs text-gray-500 font-medium mb-1">
                    {timeLabel}
                  </div>
                  <div className="space-y-1">
                    {hourEvents.map((event) => {
                      const startDate = new Date(event.start);
                      const endDate = new Date(event.end);
                      const now = new Date();
                      const isCurrent = startDate <= now && endDate >= now;
                      const isPast = endDate < now;
                      const isAllDay = event.isAllDay;

                      return (
                        <div
                          key={event.id}
                          className={`p-2 rounded text-xs border ${
                            isCurrent
                              ? "bg-blue-100 border-blue-300"
                              : isPast
                              ? "bg-gray-50 border-gray-200 text-gray-500"
                              : "bg-white border-gray-200"
                          }`}
                          style={{
                            borderLeftColor: event.calendarColor || "#4285f4",
                            borderLeftWidth: "3px",
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {event.title}
                              </div>
                              {event.calendarName && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {event.calendarName}
                                </div>
                              )}
                              {event.location && (
                                <div className="text-xs text-gray-500 mt-0.5 truncate">
                                  📍 {event.location}
                                </div>
                              )}
                              <div className="text-xs text-gray-500 mt-0.5">
                                {isAllDay
                                  ? "All day"
                                  : `${formatTime(startDate)} - ${formatTime(
                                      endDate
                                    )}`}
                              </div>
                              {event.attendees &&
                                event.attendees.length > 0 && (
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    👥 {event.attendees.length} attendee
                                    {event.attendees.length > 1 ? "s" : ""}
                                  </div>
                                )}
                            </div>
                            {event.htmlLink && (
                              <a
                                href={event.htmlLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 ml-2 flex-shrink-0"
                              >
                                Open
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
