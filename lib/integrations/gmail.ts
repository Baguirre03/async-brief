import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

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

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const query = `after:${Math.floor(yesterday.getTime() / 1000)}`;

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

    return {
      externalId: msg.id!,
      provider: "gmail",
      title: subject,
      content: preview,
      sender: from,
      url: `https://mail.google.com/mail/u/0/#inbox/${msg.id}`,
      recievedAt: new Date(date || Date.now()),
      priority: "medium",
    };
  });

  for (const message of parsedMessages) {
    await prisma.message.upsert({
      where: {
        provider_externalId_userId: {
          provider: "gmail",
          externalId: message.externalId,
          userId,
        },
      },
      update: {},
      create: {
        ...message,
        userId,
      },
    });
  }

  return parsedMessages;
}
