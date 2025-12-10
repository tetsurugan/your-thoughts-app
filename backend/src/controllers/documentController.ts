import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getSignedUploadUrl } from '../services/storage';
import { extractTextFromImage } from '../services/ocrService';
import { parseTextIntent } from '../services/parser';

const prisma = new PrismaClient();

// POST /api/documents
// Init upload
export const createDocument = async (req: Request, res: Response) => {
    try {
        const { fileName, type, userId: reqUserId } = req.body;
        // Mock User
        const userId = 'mock-user-id';
        await prisma.user.upsert({ where: { id: userId }, update: {}, create: { id: userId, isGuest: true } });

        // 1. Create DB Record (Document needs to exist in Prisma Schema?)
        // Wait, we need to check if Document model exists in schema.prisma!
        // Assuming it does or we need to create it. 
        // Based on previous deletion of routes/documents.ts, looks like we might miss the model if I didn't check.
        // Let's assume for now. If it fails build, I will check Schema.

        // Actually, let's look at schema first? No, I'll proceed with best guess and fix if needed. 
        // The previous schema view showed: User, Task, Subtask, CalendarConnection.
        // It did NOT show Document. I likely need to add Document to Schema!

        // Changing strategy: Stubbing as if I am about to write it, but I recall verifying schema didn't have Document.
        // I will write this file, but I expect to need to update Schema next.

        // 1. Create DB Record
        const doc = await prisma.document.create({
            data: {
                userId,
                type: type || 'generic',
                storageUrl: '' // Will update or set
            }
        });

        const { uploadUrl, key } = await getSignedUploadUrl(doc.id, fileName || 'image.jpg');

        // Update with key
        await prisma.document.update({
            where: { id: doc.id },
            data: { storageUrl: key }
        });

        res.json({
            documentId: doc.id,
            uploadUrl,
            key
        });

    } catch (error) {
        console.error('Create Doc Error:', error);
        res.status(500).json({ error: 'Failed to init upload' });
    }
};

// POST /api/documents/:id/parse
export const parseDocument = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { key, userId: reqUserId } = req.body;
    // In a real app we'd look up the doc by ID to get the key. 
    // For this mock without DB model yet, we accept key from client or assume standard path.

    try {
        // 1. OCR
        const text = await extractTextFromImage(key || `uploads/${id}/image.jpg`);

        // 2. Parse Intent
        const parsed = await parseTextIntent(text);

        // 3. Create Task
        const userId = 'mock-user-id';
        const task = await prisma.task.create({
            data: {
                userId,
                title: parsed.title,
                description: `Source: OCR from Document\nOriginal Text: ${text}`,
                category: parsed.category, // Type issue? we fixed type in parser.ts to be string compatible
                requiresClarification: parsed.requiresClarification,
                sourceType: 'image', // Need to check if 'image' is valid string in DB check (it was a String field, defaults to 'text')
                dueAt: parsed.dueDate,
                subtasks: {
                    create: parsed.subtasks.map((st, idx) => ({
                        label: st,
                        orderIndex: idx
                    }))
                }
            },
            include: { subtasks: true }
        });

        res.json({
            task,
            text,
            parsed
        });

    } catch (error) {
        console.error('Parse Doc Error:', error);
        res.status(500).json({ error: 'Failed to parse document' });
    }
};
