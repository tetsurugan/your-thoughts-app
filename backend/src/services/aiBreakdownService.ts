import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize Clients
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

const gemini = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

// Interface for detected tasks
export interface DetectedTask {
    title: string;
    dueAt?: string;  // ISO date string if time was detected
    category?: string;
}

/**
 * Detect multiple tasks from a single input text
 * e.g., "go to the store at 6 and talk to my PO at 8" -> 2 tasks
 */
export async function detectMultipleTasks(inputText: string): Promise<DetectedTask[]> {
    console.log(`[MultiTask] Detecting tasks in: "${inputText}"`);

    let tasks: DetectedTask[] = [];

    // 1. Try OpenAI
    if (openai) {
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a task parser. Given input text, identify ALL separate tasks mentioned.
For each task, extract:
- title: Clear task description
- dueAt: ISO date string if a time is mentioned (use today's date with the time)
- category: One of "legal", "benefits", "health", "work", "personal"

Return JSON: { "tasks": [{ "title": "...", "dueAt": "...", "category": "..." }] }
If only ONE task, still return array with 1 item.
Today is: ${new Date().toISOString().split('T')[0]}`
                    },
                    {
                        role: 'user',
                        content: inputText
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (content) {
                const parsed = JSON.parse(content);
                tasks = parsed.tasks || [];
                console.log(`[MultiTask] OpenAI detected ${tasks.length} tasks`);
            }
        } catch (error) {
            console.error('[MultiTask] OpenAI Error:', error);
        }
    }

    // 2. Try Gemini (if OpenAI failed)
    if (tasks.length === 0 && gemini) {
        try {
            const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
            const today = new Date().toISOString().split('T')[0];
            const prompt = `Parse this text into separate tasks. For each task, extract title, dueAt (ISO datetime if time mentioned, use ${today} for today), and category (legal/benefits/health/work/personal).

Text: "${inputText}"

Return ONLY JSON: { "tasks": [{ "title": "...", "dueAt": "...", "category": "..." }] }`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(text);
            tasks = parsed.tasks || [];
            console.log(`[MultiTask] Gemini detected ${tasks.length} tasks`);
        } catch (error) {
            console.error('[MultiTask] Gemini Error:', error);
        }
    }

    // 3. Fallback: regex-based splitting on "and", "then", ","
    if (tasks.length === 0) {
        console.log('[MultiTask] Using fallback regex detection');
        const parts = inputText.split(/\s+and\s+|\s+then\s+|,\s*/i).filter(p => p.trim().length > 3);

        tasks = parts.map(part => {
            // Try to extract time from each part
            const timeMatch = part.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
            let dueAt: string | undefined;

            if (timeMatch) {
                let hour = parseInt(timeMatch[1]);
                const min = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
                const ampm = timeMatch[3]?.toLowerCase();

                if (ampm === 'pm' && hour < 12) hour += 12;
                if (ampm === 'am' && hour === 12) hour = 0;

                const date = new Date();
                date.setHours(hour, min, 0, 0);
                dueAt = date.toISOString();
            }

            // Infer category from keywords
            let category = 'personal';
            const lower = part.toLowerCase();
            if (lower.includes('po') || lower.includes('probation') || lower.includes('court')) {
                category = 'legal';
            } else if (lower.includes('doctor') || lower.includes('appointment') || lower.includes('health')) {
                category = 'health';
            } else if (lower.includes('work') || lower.includes('meeting') || lower.includes('boss')) {
                category = 'work';
            }

            return {
                title: part.trim(),
                dueAt,
                category
            };
        });

        console.log(`[MultiTask] Fallback detected ${tasks.length} tasks`);
    }

    return tasks;
}

// Heuristic Templates for Fallback
const TEMPLATES: Record<string, string[]> = {
    'benefits': [
        'Gather necessary documents (ID, proof of income, residency)',
        'Find the correct application website or local office',
        'Fill out the application form',
        'Submit the application',
        'Save confirmation number and date'
    ],
    'housing': [
        'Check credit score and rental history',
        'Determine budget and desired location',
        'Search online listings (Zillow, Craigslist)',
        'Contact landlords to schedule viewings',
        'Fill out rental applications'
    ],
    'court': [
        'Confirm court date, time, and location',
        'Review legal documents/paperwork',
        'Contact attorney or public defender',
        'Plan transportation to arrival 30 mins early',
        'Dress appropriately for court'
    ],
    'probation': [
        'Confirm meeting time with PO',
        'Gather proof of employment/residency if needed',
        'Prepare payment for any fees',
        'Arrive 15 minutes early',
        'Update calendar with next visit'
    ],
    'default': [
        'Define the first small step',
        'Gather materials needed',
        'Set a dedicated time to work on this',
        'Execute the first step'
    ]
};

export async function breakdownTask(taskId: string, taskTitle: string): Promise<string[]> {
    console.log(`Breaking down task: "${taskTitle}"`);

    let subtasks: string[] = [];

    // 1. Try OpenAI
    if (openai) {
        try {
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You help break down tasks into actionable steps.

First, decide: Can this task actually be broken down into multiple steps?
- If the task is too simple, vague, or meaningless (like "test", "hello", single words without context), return: { "canBreakdown": false, "subtasks": [] }
- If the task CAN be broken down into 3-5 clear, actionable steps, return: { "canBreakdown": true, "subtasks": ["step 1", "step 2", ...] }

Each subtask should be specific and something a person can actually do.`
                    },
                    {
                        role: 'user',
                        content: `Can this task be broken down? If yes, provide the steps: "${taskTitle}"`
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (content) {
                const parsed = JSON.parse(content);
                if (parsed.canBreakdown === false) {
                    console.log('AI determined task cannot be broken down');
                    return [];
                }
                subtasks = parsed.subtasks || parsed.steps || [];
            }
        } catch (error) {
            console.error('OpenAI Error:', error);
        }
    }

    // 2. Try Gemini (if OpenAI failed or missing)
    if (subtasks.length === 0 && gemini) {
        try {
            const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
            const prompt = `Analyze this task: "${taskTitle}"

First, decide: Can this task be broken down into multiple actionable steps?
- If it's too simple, vague, or meaningless (like "test", "hello", single words), respond with: { "canBreakdown": false, "subtasks": [] }
- If it CAN be broken down, respond with: { "canBreakdown": true, "subtasks": ["step 1", "step 2", "step 3"] }

Return ONLY the JSON object, no other text.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up code blocks if Gemini adds them
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanText);

            if (parsed.canBreakdown === false) {
                console.log('Gemini determined task cannot be broken down');
                return [];
            }
            subtasks = parsed.subtasks || [];
        } catch (error) {
            console.error('Gemini Error:', error);
        }
    }

    // 3. Fallback to Heuristics
    if (subtasks.length === 0) {
        console.log('Using heuristic fallback');
        const lowerTitle = taskTitle.toLowerCase();

        // Find matching template
        const match = Object.keys(TEMPLATES).find(key => lowerTitle.includes(key));
        subtasks = match ? TEMPLATES[match] : TEMPLATES['default'];
    }

    // 4. Save to DB
    if (subtasks.length > 0) {
        // Delete existing subtasks first? Or append? Let's clear for now to avoid duplicates on re-run
        await prisma.subtask.deleteMany({ where: { taskId } });

        for (let i = 0; i < subtasks.length; i++) {
            await prisma.subtask.create({
                data: {
                    taskId,
                    label: subtasks[i],
                    orderIndex: i,
                    done: false
                }
            });
        }
    }

    return subtasks;
}
