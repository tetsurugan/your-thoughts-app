export type TaskCategory = 'Probation' | 'Legal' | 'Appointment' | 'Personal';

interface ParseResult {
    title: string;
    category: TaskCategory;
    subtasks: string[];
}

export function parseTask(input: string): ParseResult {
    const normalized = input.toLowerCase();
    let category: TaskCategory = 'Personal';

    // 1. Categorization Logic
    if (normalized.match(/probation|po|officer|check-in/)) {
        category = 'Probation';
    } else if (normalized.match(/court|lawyer|judge|legal|attorney/)) {
        category = 'Legal';
    } else if (normalized.match(/doctor|meet|appointment|schedule|interview/)) {
        category = 'Appointment';
    }

    // 2. Breakdown Logic (Simple Heuristics)
    let subtasks: string[] = [];

    // "Sign up" or "Register" flows
    if (normalized.match(/sign up|register|create account|application/)) {
        subtasks = [
            'Find website or download app',
            'Create account with email',
            'Verify email/phone',
            'Complete profile setup'
        ];
    }
    // "Document" or "Paperwork" flows
    else if (normalized.match(/document|form|paperwork|application/)) {
        subtasks = [
            'Locate required form',
            'Fill out all sections',
            'Sign and date',
            'Submit or mail document'
        ];
    }
    // "Appointment" flows
    else if (normalized.match(/appointment|schedule|meeting/)) {
        subtasks = [
            'Call to schedule',
            'Add to calendar',
            'Prepare necessary documents',
            'Confirm day before'
        ];
    }

    return {
        title: input.split('\n')[0], // Use first line as title if multi-line
        category,
        subtasks
    };
}
