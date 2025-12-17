import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { parseIntent } from '../parsers/taskParser';
import { assignTaskToFolders } from '../services/aiClassifierService';

const prisma = new PrismaClient();

export const processIntent = async (req: Request, res: Response) => {
    try {
        let { text, sourceType, isRecurring, recurrenceInterval } = req.body;

        // Input validation and sanitization
        text = typeof text === 'string' ? text.trim() : '';

        if (!text || text.length === 0) {
            return res.status(400).json({ error: 'Text input is required' });
        }

        // Max length limit for input (5000 chars should be plenty for voice/text)
        if (text.length > 5000) {
            text = text.substring(0, 5000);
        }

        // 1. Parse Intent
        const parsed = await parseIntent(text);

        // 2. Get authenticated User ID
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Sanitize parsed output
        const title = parsed.title.substring(0, 500);
        const description = parsed.description ? parsed.description.substring(0, 2000) : null;

        // 3. Create Task
        const task = await prisma.task.create({
            data: {
                userId: userId, // Requires User to exist in DB, see seed/bootstrap
                title,
                description,
                category: parsed.category,
                dueAt: parsed.dueAt,
                requiresClarification: parsed.requiresClarification,
                sourceType: sourceType || 'text',
                status: 'pending',
                isRecurring: isRecurring || false,
                recurrenceInterval: recurrenceInterval || null
            }
        });

        // 4. Auto-assign to Smart Folders based on content
        const folderMatches = await assignTaskToFolders(task.id, userId, text);

        res.json({
            task,
            message: 'Task created successfully',
            clarification: parsed.requiresClarification ? parsed.clarificationPrompt : null,
            folders: folderMatches.map(f => f.name)
        });
    } catch (error) {
        console.error('Intent Error:', error);
        res.status(500).json({ error: 'Failed to process intent' });
    }
};
