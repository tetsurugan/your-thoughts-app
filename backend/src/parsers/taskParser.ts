export type TaskCategory = 'probation' | 'court' | 'benefits' | 'housing' | 'medical' | 'work' | 'other';

export interface ParsedIntent {
    title: string;
    description?: string;
    category: TaskCategory;
    dueAt?: Date;
    requiresClarification?: boolean;
    clarificationPrompt?: string;
}

export async function parseIntent(text: string): Promise<ParsedIntent> {
    const lower = text.toLowerCase();

    // 1. Category Detection
    let category: TaskCategory = 'other';
    if (lower.match(/po|probation|officer|check-in/)) category = 'probation';
    else if (lower.match(/court|hearing|appear|judge|legal/)) category = 'court';
    else if (lower.match(/benefits|snap|medicaid|food stamps|voucher/)) category = 'benefits';
    else if (lower.match(/housing|rent|lease|landlord/)) category = 'housing';
    else if (lower.match(/doctor|med(ical|icine)|prescri(ption|be)|clinic|appointment/)) category = 'medical';
    else if (lower.match(/work|job|shift|boss|interview/)) category = 'work';

    // 2. Date/Time Extraction (Improved Heuristics)
    let dueAt: Date | undefined = undefined;
    const now = new Date();

    // Time pattern: "at 7", "at 7pm", "at 7:30", "at 7:30pm", "7pm", "7:30pm"
    const timeMatch = lower.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);

    // Day pattern: "monday", "tuesday", etc.
    const dayMatch = lower.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);

    // Relative patterns
    const hasTomorrow = lower.includes('tomorrow');
    const hasToday = lower.includes('today');
    const hasNextWeek = lower.includes('next week');
    const hasThisWeek = lower.includes('this');
    const hasNext = lower.includes('next') && dayMatch;

    // Helper to parse time from match
    const parseTime = (match: RegExpMatchArray): { hours: number; minutes: number } => {
        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const meridian = match[3];

        if (meridian === 'pm' && hours < 12) hours += 12;
        if (meridian === 'am' && hours === 12) hours = 0;

        // No meridian: guess PM for business hours (1-7), keep AM for early (8-11)
        if (!meridian) {
            if (hours >= 1 && hours <= 7) hours += 12; // 1-7 → 13:00-19:00
            // 8-12 stays as-is (morning meetings)
        }

        return { hours, minutes };
    };

    // Case 1: "tomorrow at X" or just "tomorrow"
    if (hasTomorrow) {
        dueAt = new Date(now);
        dueAt.setDate(now.getDate() + 1);
        if (timeMatch) {
            const { hours, minutes } = parseTime(timeMatch);
            dueAt.setHours(hours, minutes, 0, 0);
        } else {
            dueAt.setHours(9, 0, 0, 0); // Default 9 AM
        }
    }
    // Case 2: "today at X" or explicit "today"
    else if (hasToday) {
        dueAt = new Date(now);
        if (timeMatch) {
            const { hours, minutes } = parseTime(timeMatch);
            dueAt.setHours(hours, minutes, 0, 0);
        } else {
            dueAt.setHours(17, 0, 0, 0); // Default 5 PM for "today"
        }
    }
    // Case 3: Day name (with optional "next")
    else if (dayMatch) {
        const dayName = dayMatch[1];
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDayIndex = days.indexOf(dayName);
        const currentDayIndex = now.getDay();

        let daysToAdd = targetDayIndex - currentDayIndex;
        if (daysToAdd <= 0 || hasNext) daysToAdd += 7; // Next instance or explicit "next"

        dueAt = new Date(now);
        dueAt.setDate(now.getDate() + daysToAdd);

        if (timeMatch) {
            const { hours, minutes } = parseTime(timeMatch);
            dueAt.setHours(hours, minutes, 0, 0);
        } else {
            dueAt.setHours(9, 0, 0, 0); // Default 9 AM
        }
    }
    // Case 4: Just a time like "at 7" - assume today if future, tomorrow if past
    else if (timeMatch && lower.includes('at ')) {
        const { hours, minutes } = parseTime(timeMatch);
        dueAt = new Date(now);
        dueAt.setHours(hours, minutes, 0, 0);

        // If time is in the past, assume tomorrow
        if (dueAt <= now) {
            dueAt.setDate(dueAt.getDate() + 1);
        }
    }

    // 3. Ambiguity Detection
    // Example rule: very short input or "book" without object
    let requiresClarification = false;
    let clarificationPrompt = undefined;

    if (lower.trim() === 'book' || (lower.includes('book') && lower.split(' ').length < 3)) {
        requiresClarification = true;
        clarificationPrompt = "Is this a task (read a book) or an appointment (book a slot)?";
    }

    return {
        title: text,
        description: text,
        category,
        dueAt,
        requiresClarification,
        clarificationPrompt
    };
}
