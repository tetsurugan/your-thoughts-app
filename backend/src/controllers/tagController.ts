import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/tags
export const getTags = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;
    try {
        const tags = await prisma.tag.findMany({
            where: { userId },
            orderBy: { name: 'asc' }
        });
        res.json(tags);
    } catch (error) {
        console.error('Get Tags Error:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
};

// POST /api/tags
export const createTag = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;
    const { name, color } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Tag name is required' });
    }

    try {
        const tag = await prisma.tag.create({
            data: {
                name: name.trim(),
                color: color || null,
                userId
            }
        });
        res.status(201).json(tag);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Tag already exists' });
        }
        console.error('Create Tag Error:', error);
        res.status(500).json({ error: 'Failed to create tag' });
    }
};

// DELETE /api/tags/:id
export const deleteTag = async (req: Request, res: Response) => {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    try {
        // Verify ownership
        const tag = await prisma.tag.findFirst({
            where: { id, userId }
        });

        if (!tag) {
            return res.status(404).json({ error: 'Tag not found' });
        }

        await prisma.tag.delete({ where: { id } });
        res.json({ message: 'Tag deleted' });
    } catch (error) {
        console.error('Delete Tag Error:', error);
        res.status(500).json({ error: 'Failed to delete tag' });
    }
};

// Helper: Seed default tags based on account purpose
export const seedDefaultTags = async (userId: string, purpose: string) => {
    console.log(`[TagSeeding] START for User ${userId}, Purpose: ${purpose}`);

    const tagsByPurpose: Record<string, string[]> = {
        legal: ['Court Date', 'PO Meeting', 'Document Due', 'Appointment'],
        school: ['Homework', 'Exam', 'Project', 'Reading'],
        work: ['Meeting', 'Deadline', 'Follow-up', 'Review'],
        custom: [] // No default tags
    };

    const tags = tagsByPurpose[purpose] || [];

    if (tags.length === 0) {
        console.log(`[TagSeeding] No default tags found for purpose '${purpose}'`);
        return;
    }

    console.log(`[TagSeeding] Found ${tags.length} tags to seed: ${JSON.stringify(tags)}`);

    for (const name of tags) {
        try {
            await prisma.tag.create({
                data: { name, userId }
            });
            console.log(`[TagSeeding] Created tag '${name}'`);
        } catch (e: any) {
            // Prisma error P2002 is unique constraint violation
            if (e.code === 'P2002') {
                console.log(`[TagSeeding] Skipped duplicate tag '${name}' for user ${userId}`);
            } else {
                console.error(`[TagSeeding] Failed to create tag '${name}':`, e);
            }
        }
    }
    console.log(`[TagSeeding] COMPLETE for User ${userId}`);
};
