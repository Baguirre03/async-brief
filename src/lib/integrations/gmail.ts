import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

interface GmailMessage {
  id: string;
  externalId: string;
  provider: string;
  title: string | null;
  content: string | null;
  preview: string | null;
  sender: string | null;
  url: string | null;
  recievedAt: Date;
  priority: string;
  status: string;
  tags: string[];
}

/**
 * Fetch Gmail messages for a user
 * @param userId - The ID of the user
 * @returns The fetched messages
 * TODO: make smarter parsing of messages for information
 */
export async function fetchGmailMessages(userId: string) {
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

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const query = `after:${Math.floor(threeDaysAgo.getTime() / 1000)} -from:me`;

  const response = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 50,
  });

  const messages = response.data.messages || [];

  const fullMessages = await Promise.all(
    messages.map(async (msg) => {
      const details = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "full",
      });
      return details.data;
    })
  );

  const parsedMessages = fullMessages.map((msg) => {
    const headers = msg.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
        ?.value || "";

    const subject = getHeader("subject");
    const from = getHeader("from");
    const date = getHeader("date");

    let body = "";
    if (msg.payload?.body?.data) {
      body = Buffer.from(msg.payload.body.data, "base64").toString();
    } else if (msg.payload?.parts) {
      const textPart = msg.payload.parts.find(
        (part) => part.mimeType === "text/plain"
      );
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, "base64").toString();
      }
    }

    const preview = body.substring(0, 200);

    // Check if message is read by looking at the labelIds
    const isUnread = msg.labelIds?.includes("UNREAD") ?? true;

    return {
      id: msg.id!,
      externalId: msg.id!,
      provider: "gmail",
      title: subject,
      content: body,
      preview: preview,
      sender: from,
      url: `https://mail.google.com/mail/u/0/#inbox/${msg.id}`,
      recievedAt: new Date(date || Date.now()),
      priority: "medium",
      status: isUnread ? "unread" : "read",
      tags: [],
    } satisfies GmailMessage;
  });

  return parsedMessages;
}

/**
 * Mark a Gmail message as read by removing the UNREAD label
 * @param userId - The ID of the user
 * @param messageId - The ID of the message to mark as read
 */
export async function markGmailMessageAsRead(
  userId: string,
  messageId: string
) {
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

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    await gmail.users.messages.modify({
      userId: "me",
      id: messageId,
      requestBody: {
        removeLabelIds: ["UNREAD"],
      },
    });
  } catch (error) {
    console.error("Error marking Gmail message as read:", error);
    throw new Error("Failed to mark message as read");
  }
}

/**
 * Delete a Gmail message
 * @param userId - The ID of the user
 * @param messageId - The ID of the message to delete
 */
export async function deleteGmailMessage(userId: string, messageId: string) {
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

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    await gmail.users.messages.delete({
      userId: "me",
      id: messageId,
    });
  } catch (error) {
    console.error("Error deleting Gmail message:", error);
    throw new Error("Failed to delete message");
  }
}
