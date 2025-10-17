import { MessagesList } from "@/app/components/messages-list";
import { GoogleCalendarBox } from "@/app/components/google-calendar-box";

export function MainContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <GoogleCalendarBox />
          </div>

          {/* Messages Section */}
          <div className="lg:col-span-2">
            <MessagesList />
          </div>
        </div>
      </div>
    </div>
  );
}
