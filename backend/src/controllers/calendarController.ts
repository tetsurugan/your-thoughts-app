import { Request, Response } from 'express';
import { createOAuthClient } from '../config/googleConfig';
import { PrismaClient } from '@prisma/client';
import { createEventForTask } from '../services/googleCalendarService';

const prisma = new PrismaClient();

// GET /api/calendar/status
// Check if user has valid Google Calendar connection
export const getStatus = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const connection = await prisma.calendarConnection.findUnique({
            where: { userId }
        });
        res.json({ connected: !!connection?.accessToken });
    } catch {
        res.json({ connected: false });
    }
};

// GET /api/calendar/google/connect
// Redirects user to Google OAuth consent screen
export const connectGoogle = (req: Request, res: Response) => {
    const client = createOAuthClient();
    const url = client.generateAuthUrl({
        access_type: 'offline', // Get refresh token
        scope: ['https://www.googleapis.com/auth/calendar.events'],
        prompt: 'consent' // Force new refresh token
    });
    res.redirect(url);
};

// GET /api/calendar/google/callback
// Handles OAuth callback, exchanges code for tokens
export const googleCallback = async (req: Request, res: Response) => {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
        return res.status(400).send('Invalid code');
    }

    try {
        const client = createOAuthClient();
        const { tokens } = await client.getToken(code);

        // Get userId from state parameter or session
        // For now, we need to get it from a stored state - this is a known OAuth flow limitation
        // In production, use state parameter to track which user initiated the flow
        const userId = req.user?.userId;
        if (!userId) {
            // Redirect to frontend with error if no auth
            return res.redirect('/settings?error=auth_required');
        }

        const expiresAt = new Date();
        if (tokens.expiry_date) {
            expiresAt.setTime(tokens.expiry_date);
        } else {
            expiresAt.setHours(expiresAt.getHours() + 1);
        }

        // Store tokens
        await prisma.calendarConnection.upsert({
            where: { userId },
            update: {
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token!, // Warning: might be undefined if not first time/prompt=consent
                expiresAt,
            },
            create: {
                userId,
                provider: 'google',
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token || '',
                expiresAt,
            }
        });

        // Simple success page
        res.send(`
            <h1>Connected!</h1>
            <p>Your Google Calendar is now connected to Your Thoughts.</p>
            <p>You can close this tab and go back to the app.</p>
            <script>
                // Optional: try to close or redirect back to app scheme
                // window.close();
            </script>
        `);
    } catch (error) {
        console.error('OAuth Error:', error);
        res.status(500).send('Authentication failed');
    }
};

// POST /api/calendar/events
// Creates an event from a task
export const createEvent = async (req: Request, res: Response) => {
    const { taskId } = req.body;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // 1. Fetch Task
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        if (!task.dueAt) return res.status(400).json({ error: 'Task has no due date' });

        // 2. Create Event via Service
        const googleEventId = await createEventForTask(userId, task);

        // 3. Save ID to Task
        await prisma.task.update({
            where: { id: taskId },
            data: { googleEventId }
        });

        res.json({ ok: true, googleEventId });
    } catch (error: any) {
        console.error('Create Event Error:', error);
        res.status(500).json({ error: error.message || 'Failed to create event' });
    }
};

// DELETE /api/calendar/events/:taskId
// Deletes an event from Google Calendar
export const deleteEvent = async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        // 1. Fetch Task
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        if (!task.googleEventId) return res.status(400).json({ error: 'Task not synced to calendar' });

        // 2. Delete Event via Service
        const { deleteEventForTask } = await import('../services/googleCalendarService');
        await deleteEventForTask(userId, task.googleEventId);

        // 3. Clear ID from Task
        await prisma.task.update({
            where: { id: taskId },
            data: { googleEventId: null }
        });

        res.json({ ok: true });
    } catch (error: any) {
        console.error('Delete Event Error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete event' });
    }
};
