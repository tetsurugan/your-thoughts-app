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
                        content: 'You are a helpful assistant that breaks down complex tasks into 3-5 simple, actionable subtasks. Return only a JSON array of strings.'
                    },
                    {
                        role: 'user',
                        content: `Break down this task: "${taskTitle}"`
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (content) {
                const parsed = JSON.parse(content);
                // Handle various JSON shapes { subtasks: [] } or { steps: [] } or just []
                subtasks = parsed.subtasks || parsed.steps || parsed.list || [];
            }
        } catch (error) {
            console.error('OpenAI Error:', error);
        }
    }

    // 2. Try Gemini (if OpenAI failed or missing)
    if (subtasks.length === 0 && gemini) {
        try {
            const model = gemini.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `Break down the task "${taskTitle}" into 3-5 simple, actionable subtasks. Return ONLY a raw JSON array of strings. Example: ["Step 1", "Step 2"]`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up code blocks if Gemini adds them
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            subtasks = JSON.parse(cleanText);
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
