import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FetchGmailButton } from "@/components/fetch-gmail-button"

export default async function Dashboard() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Get messages from database
  const messages = await prisma.message.findMany({
    where: {
      userId: session.user.id,
      status: 'unread',
    },
    orderBy: {
      receivedAt: 'desc',
    },
    take: 50,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome, {session.user?.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              {messages.length} unread messages
            </p>
          </div>
          <FetchGmailButton />
        </div>

        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow">
              <p className="text-gray-600">
                No messages yet. Click "Fetch Gmail" to load your recent emails.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{message.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{message.sender}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                      {message.provider}
                    </span>
                    {message.priority === 'high' && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                        High Priority
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 mt-3 line-clamp-2">{message.content}</p>
                
                {message.tags.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {message.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {new Date(message.receivedAt).toLocaleString()}
                  </span>
                  
                    href={message.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View in Gmail →
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}