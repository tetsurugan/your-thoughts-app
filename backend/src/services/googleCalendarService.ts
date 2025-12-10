import { PrismaClient, Task } from "@prisma/client";
import { google } from "googleapis";
import { createOAuthClient } from "../config/googleConfig";

const prisma = new PrismaClient();

export async function createEventForTask(userId: string, task: Task): Promise<string> {
    // 1. Look up connection
    const connection = await prisma.calendarConnection.findUnique({
        where: { userId }
    });

    if (!connection) {
        throw new Error("User is not connected to Google Calendar");
    }

    // 2. Setup Client
    const client = createOAuthClient();
    client.setCredentials({
        access_token: connection.accessToken,
        refresh_token: connection.refreshToken,
        expiry_date: connection.expiresAt.getTime()
    });

    // Handle token refresh automatically handled by googleapis if refresh_token is set? 
    // Usually yes, but we might want to listen to 'tokens' event to save new ones.
    // For MVP, we proceed. If access token is expired and we have refresh token, it tries to refresh.

    // 3. Insert Event
    const calendar = google.calendar({ version: 'v3', auth: client });

    // Default duration: 1 hour if not specified? 
    // Task has `dueAt`. Let's assume it's the start time.
    const startTime = new Date(task.dueAt!); // Checked in controller
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    const event = {
        summary: task.title,
        description: task.description || "",
        start: {
            dateTime: startTime.toISOString(),
            // timeZone: 'America/Chicago' // Optional, defaults to calendar time
        },
        end: {
            dateTime: endTime.toISOString(),
        }
    };

    const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
    });

    if (!res.data.id) {
        throw new Error("Failed to retrieve event ID from Google");
    }

    return res.data.id;
}

export async function deleteEventForTask(userId: string, googleEventId: string): Promise<void> {
    // 1. Look up connection
    const connection = await prisma.calendarConnection.findUnique({
        where: { userId }
    });

    if (!connection) {
        throw new Error("User is not connected to Google Calendar");
    }

    // 2. Setup Client
    const client = createOAuthClient();
    client.setCredentials({
        access_token: connection.accessToken,
        refresh_token: connection.refreshToken,
        expiry_date: connection.expiresAt.getTime()
    });

    // 3. Delete Event
    const calendar = google.calendar({ version: 'v3', auth: client });

    await calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId,
    });
}
