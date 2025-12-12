import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Demo tasks moved from frontend to backend
const DEMO_LEGAL_TASKS = [
    {
        title: "Call Public Defender - Urgent",
        description: "Ask about plea deal options and upcoming hearing date.",
        category: "legal",
        dueAt: new Date(), // Today
        isRecurring: false,
        sourceType: "text"
    },
    {
        title: "Submit Income Verification",
        description: "Required for fee waiver application. Take photo of pay stub.",
        category: "legal",
        dueAt: new Date(), // Today
        isRecurring: false,
        sourceType: "text"
    },
    {
        title: "PO Check-in with Officer Martinez",
        description: "Monthly probation check-in. Bring ID and proof of address.",
        category: "legal",
        dueAtOffset: 2, // Tuesday (relative to now)
        isRecurring: true,
        recurrenceInterval: "monthly",
        sourceType: "text"
    },
    {
        title: "Court Hearing - Case #2024-CR-1234",
        description: "Appearance required. Courtroom 3B, 9:00 AM. Dress code: business casual.",
        category: "legal",
        dueAtOffset: 4, // Thursday
        isRecurring: false,
        sourceType: "text"
    },
    {
        title: "Pay Court Fees - $150",
        description: "Monthly payment due. Can pay online or at clerk's office.",
        category: "legal",
        dueAtOffset: 30, // End of month approx
        isRecurring: true,
        recurrenceInterval: "monthly",
        sourceType: "text"
    }
];

function getFutureDate(daysOffset: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(10, 0, 0, 0);
    return date;
}

export const seedDemoTasks = async (userId: string, purpose: string) => {
    if (purpose !== 'legal') return; // Only seeding legal for now

    console.log(`[DemoSeeding] Seeding tasks for User ${userId}`);

    for (const task of DEMO_LEGAL_TASKS) {
        try {
            const dueAt = task.dueAt ? task.dueAt : getFutureDate(task.dueAtOffset || 1);

            await prisma.task.create({
                data: {
                    userId,
                    title: task.title,
                    description: task.description,
                    category: task.category,
                    dueAt: dueAt.toISOString(),
                    isRecurring: task.isRecurring,
                    recurrenceInterval: task.recurrenceInterval,
                    sourceType: task.sourceType,
                    status: 'pending'
                }
            });
            console.log(`[DemoSeeding] Created task: ${task.title}`);
        } catch (error) {
            console.error(`[DemoSeeding] Failed to create task ${task.title}:`, error);
        }
    }
};
