// import { TaskCategory } from '@prisma/client';
export type TaskCategory = 'probation' | 'court' | 'benefits' | 'housing' | 'medical' | 'work' | 'other' | 'PERSONAL' | 'PROBATION' | 'LEGAL' | 'BENEFITS' | 'MEDICAL'; // Loose typing for legacy parser support

interface ParsedIntent {
    title: string;
    category: string;
    dueDate: Date | null;
    subtasks: string[];
    requiresClarification: boolean;
    clarificationPrompt?: string;
}

export async function parseTextIntent(text: string): Promise<ParsedIntent> {
    const lower = text.toLowerCase();
    let category: TaskCategory = 'PERSONAL';
    let requiresClarification = false;

    // 1. Keyword Mapping (Rules Engine)
    if (lower.match(/probation|po|officer|check-in/)) category = 'PROBATION';
    else if (lower.match(/court|lawyer|judge|legal|appear/)) category = 'LEGAL';
    else if (lower.match(/benefits|snap|medicaid|housing|voucher/)) category = 'BENEFITS';
    else if (lower.match(/doctor|appointment|meds|prescription/)) category = 'MEDICAL';

    // 2. Date Extraction (Simple Regex MVP)
    // real implementation would use 'chrono-node' or similar
    const today = new Date();
    let dueDate: Date | null = null;

    if (lower.includes('tomorrow')) {
        dueDate = new Date(today);
        dueDate.setDate(today.getDate() + 1);
    } else if (lower.includes('next week')) {
        dueDate = new Date(today);
        dueDate.setDate(today.getDate() + 7);
    }

    // 3. Ambiguity Detection
    // "Book" is ambiguous: Read a book vs Book an appt?
    if (lower === 'book' || lower.length < 4) {
        requiresClarification = true;
    }

    // 4. Subtask Generation (Static heuristics for MVP)
    const subtasks: string[] = [];
    if (category === 'LEGAL' || lower.includes('court')) {
        subtasks.push('Find court papers', 'Check wardrobe', 'Arrange transport');
    } else if (category === 'BENEFITS' || lower.includes('apply')) {
        subtasks.push('Gather ID/SSN', 'Find proof of income', 'Submit application');
    }

    return {
        title: text.split('\n')[0].substring(0, 100),
        category,
        dueDate,
        subtasks,
        requiresClarification,
        clarificationPrompt: requiresClarification ? "Could you be more specific?" : undefined
    };
}
