import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { breakdownTask, detectMultipleTasks } from '../services/aiBreakdownService';

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
            orderBy: { createdAt: 'desc' }
        });

        console.log(`[getTasks] User ${userId} fetched ${tasks.length} tasks`);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

// PATCH /api/tasks/:id
export const updateTask = async (req: Request, res: Response) => {
    const { id } = req.params;
    let { status, title, dueAt, isRecurring, recurrenceInterval } = req.body;

    // Sanitize title if provided
    if (title !== undefined) {
        title = typeof title === 'string' ? title.trim() : '';
        if (title.length === 0) {
            return res.status(400).json({ error: 'Task title cannot be empty' });
        }
        if (title.length > 500) {
            title = title.substring(0, 500);
        }
    }

    try {
        // Get current task to check if title is changing
        const existingTask = await prisma.task.findUnique({ where: { id } });
        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const titleChanged = title && title !== existingTask.title;

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

        // If title changed, regenerate subtasks through AI
        if (titleChanged) {
            console.log(`[UpdateTask] Title changed from "${existingTask.title}" to "${title}", regenerating subtasks`);
            // Run async - don't wait, let it happen in background
            breakdownTask(id, title).catch(err => {
                console.error('[UpdateTask] Failed to regenerate subtasks:', err);
            });
        }

        // SERVER-SIDE RECURRENCE LOGIC
        // When a recurring task is completed, generate the next instance server-side only
        // Uses recurrenceSeriesId to link all tasks in a series
        if (status === 'completed' && task.isRecurring && task.recurrenceInterval) {
            const seriesId = task.recurrenceSeriesId || task.id; // First task becomes the series root

            // Calculate next due date
            const currentDue = task.dueAt || new Date();
            let nextDue = new Date(currentDue);

            console.log('[Recurrence] Completing task:', { id, currentDue: currentDue.toISOString(), interval: task.recurrenceInterval });

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

            console.log('[Recurrence] Next due date calculated:', nextDue.toISOString());

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
    let { title, description, category, dueAt, isRecurring, recurrenceInterval, sourceType } = req.body;

    // Input validation and sanitization
    title = typeof title === 'string' ? title.trim() : '';
    description = typeof description === 'string' ? description.trim() : '';

    if (!title || title.length === 0) {
        return res.status(400).json({ error: 'Task title is required' });
    }

    // Max length limits
    if (title.length > 500) {
        title = title.substring(0, 500);
    }
    if (description && description.length > 2000) {
        description = description.substring(0, 2000);
    }

    try {
        const task = await prisma.task.create({
            data: {
                userId,
                title,
                description: description || null,
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

// POST /api/tasks/detect - Detect multiple tasks from input text
export const detectTasks = async (req: Request, res: Response) => {
    let { text } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Input validation
    text = typeof text === 'string' ? text.trim() : '';
    if (!text || text.length === 0) {
        return res.status(400).json({ error: 'Text input required' });
    }

    // Max length limit
    if (text.length > 5000) {
        text = text.substring(0, 5000);
    }

    try {
        const detectedTasks = await detectMultipleTasks(text);
        res.json({ tasks: detectedTasks });
    } catch (error) {
        console.error('Detect Tasks Error:', error);
        res.status(500).json({ error: 'Failed to detect tasks' });
    }
};

