import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ensureSystemFolders, SYSTEM_FOLDERS } from '../services/aiClassifierService';

const prisma = new PrismaClient();

// GET /api/folders
// List all folders for user (system + custom)
export const getFolders = async (req: Request, res: Response) => {
    const userId = 'mock-user-id'; // Auth placeholder

    try {
        // Ensure system folders exist
        await ensureSystemFolders(userId);

        const folders = await prisma.folder.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { tasks: true }
                }
            },
            orderBy: [
                { isSystem: 'desc' }, // System folders first
                { name: 'asc' }
            ]
        });

        // Transform to include task count
        const result = folders.map(f => ({
            ...f,
            taskCount: f._count.tasks
        }));

        res.json(result);
    } catch (error) {
        console.error('Get Folders Error:', error);
        res.status(500).json({ error: 'Failed to fetch folders' });
    }
};

// POST /api/folders
// Create a custom folder
export const createFolder = async (req: Request, res: Response) => {
    const userId = 'mock-user-id'; // Auth placeholder
    const { name, icon, color } = req.body;

    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Folder name is required' });
    }

    try {
        const folder = await prisma.folder.create({
            data: {
                userId,
                name: name.trim(),
                icon: icon || '📁',
                color: color || '#64748b',
                isSystem: false
            }
        });

        res.json(folder);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Folder with this name already exists' });
        }
        console.error('Create Folder Error:', error);
        res.status(500).json({ error: 'Failed to create folder' });
    }
};

// DELETE /api/folders/:id
// Delete a custom folder (not system folders)
export const deleteFolder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = 'mock-user-id'; // Auth placeholder

    try {
        const folder = await prisma.folder.findUnique({ where: { id } });

        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        if (folder.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        if (folder.isSystem) {
            return res.status(400).json({ error: 'Cannot delete system folders' });
        }

        await prisma.folder.delete({ where: { id } });
        res.json({ ok: true });
    } catch (error) {
        console.error('Delete Folder Error:', error);
        res.status(500).json({ error: 'Failed to delete folder' });
    }
};

// GET /api/folders/:id/tasks
// Get tasks in a specific folder
export const getTasksInFolder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = 'mock-user-id'; // Auth placeholder

    try {
        const folder = await prisma.folder.findUnique({
            where: { id },
            include: {
                tasks: {
                    include: {
                        task: {
                            include: { subtasks: true }
                        }
                    },
                    orderBy: { confidence: 'desc' }
                }
            }
        });

        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        if (folder.userId !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Extract tasks from junction table
        const tasks = folder.tasks.map(tf => ({
            ...tf.task,
            folderConfidence: tf.confidence
        }));

        res.json(tasks);
    } catch (error) {
        console.error('Get Tasks in Folder Error:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

// POST /api/tasks/:taskId/folders
// Manually assign task to folders
export const assignTaskToFolders = async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const { folderIds } = req.body;
    const userId = 'mock-user-id'; // Auth placeholder

    if (!Array.isArray(folderIds)) {
        return res.status(400).json({ error: 'folderIds must be an array' });
    }

    try {
        // Verify task exists and belongs to user
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task || task.userId !== userId) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Clear existing folder assignments
        await prisma.taskFolder.deleteMany({ where: { taskId } });

        // Create new assignments (user-assigned = confidence 1.0)
        for (const folderId of folderIds) {
            await prisma.taskFolder.create({
                data: {
                    taskId,
                    folderId,
                    confidence: 1.0
                }
            });
        }

        res.json({ ok: true, assigned: folderIds.length });
    } catch (error) {
        console.error('Assign Task to Folders Error:', error);
        res.status(500).json({ error: 'Failed to assign folders' });
    }
};
