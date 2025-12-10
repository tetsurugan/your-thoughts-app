import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { breakdownTask } from '../services/aiBreakdownService';

const prisma = new PrismaClient();

// GET /api/tasks?scope=today|overdue|upcoming
export const getTasks = async (req: Request, res: Response) => {
    const { scope } = req.query;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(startOfDay.getDate() + 1);

        let whereClause: any = { userId };

        if (scope === 'today') {
            // Show today's tasks AND tasks with no due date
            whereClause.OR = [
                {
                    dueAt: {
                        gte: startOfDay,
                        lt: endOfDay
                    }
                },
                {
                    dueAt: null
                }
            ];
        } else if (scope === 'overdue') {
            whereClause.dueAt = {
                lt: now
            };
            whereClause.status = 'pending';
        } else if (scope === 'upcoming') {
            whereClause.dueAt = {
                gte: endOfDay
            };
        }

        const tasks = await prisma.task.findMany({
            where: whereClause,
            include: { subtasks: true },
            orderBy: { dueAt: 'asc' }
        });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

// PATCH /api/tasks/:id
export const updateTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, title, dueAt, isRecurring, recurrenceInterval } = req.body;

    try {
        const task = await prisma.task.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(title && { title }),
                ...(dueAt && { dueAt: new Date(dueAt) }),
                ...(isRecurring !== undefined && { isRecurring }),
                ...(recurrenceInterval && { recurrenceInterval })
            }
        });

        // SERVER-SIDE RECURRENCE LOGIC
        // When a recurring task is completed, generate the next instance server-side only
        // Uses recurrenceSeriesId to link all tasks in a series
        if (status === 'completed' && task.isRecurring && task.recurrenceInterval) {
            const seriesId = task.recurrenceSeriesId || task.id; // First task becomes the series root

            // Calculate next due date
            const currentDue = task.dueAt || new Date();
            let nextDue = new Date(currentDue);

            switch (task.recurrenceInterval) {
                case 'daily':
                    nextDue.setDate(nextDue.getDate() + 1);
                    break;
                case 'weekly':
                    nextDue.setDate(nextDue.getDate() + 7);
                    break;
                case 'monthly':
                    nextDue.setMonth(nextDue.getMonth() + 1);
                    break;
                case 'yearly':
                    nextDue.setFullYear(nextDue.getFullYear() + 1);
                    break;
            }

            // DUPLICATE PREVENTION: Check if next instance already exists
            const existingNext = await prisma.task.findFirst({
                where: {
                    recurrenceSeriesId: seriesId,
                    status: 'pending',
                    dueAt: {
                        gte: new Date(nextDue.getTime() - 86400000), // Within 1 day
                        lte: new Date(nextDue.getTime() + 86400000)
                    }
                }
            });

            if (!existingNext) {
                // Create the next instance with same series ID
                await prisma.task.create({
                    data: {
                        userId: task.userId,
                        title: task.title,
                        description: task.description,
                        category: task.category,
                        sourceType: task.sourceType,
                        status: 'pending',
                        dueAt: nextDue,
                        isRecurring: true,
                        recurrenceInterval: task.recurrenceInterval,
                        recurrenceSeriesId: seriesId, // Link to series
                        requiresClarification: false
                    }
                });
            }

            // Update original task with series ID if not set
            if (!task.recurrenceSeriesId) {
                await prisma.task.update({
                    where: { id },
                    data: { recurrenceSeriesId: seriesId }
                });
            }
        }

        res.json(task);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: 'Failed to update task' });
    }
};

export const generateBreakdown = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        const subtasks = await breakdownTask(id, task.title);
        res.json({ subtasks });
    } catch (error) {
        console.error('Breakdown Error:', error);
        res.status(500).json({ error: 'Failed to break down task' });
    }
};

export const toggleSubtask = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { done } = req.body;
    try {
        const subtask = await prisma.subtask.update({
            where: { id },
            data: { done }
        });
        res.json(subtask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update subtask' });
    }
};

// POST /api/tasks - Direct task creation (for demo mode and seeding)
export const createTask = async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { title, description, category, dueAt, isRecurring, recurrenceInterval, sourceType } = req.body;

    try {
        const task = await prisma.task.create({
            data: {
                userId,
                title,
                description,
                category: category || 'general',
                dueAt: dueAt ? new Date(dueAt) : null,
                isRecurring: isRecurring || false,
                recurrenceInterval: recurrenceInterval || null,
                status: 'pending'
            }
        });
        res.json(task);
    } catch (error) {
        console.error('Create Task Error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};

// DELETE /api/tasks/:id - Delete a task
export const deleteTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Verify task belongs to user
        const task = await prisma.task.findFirst({
            where: { id, userId }
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Delete subtasks first
        await prisma.subtask.deleteMany({ where: { taskId: id } });

        // Delete task
        await prisma.task.delete({ where: { id } });

        res.json({ success: true });
    } catch (error) {
        console.error('Delete Task Error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};

