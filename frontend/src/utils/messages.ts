/**
 * Centralized Error & Success Messages
 * 
 * Tone: warm, steady, non-judgmental, supportive without being sentimental.
 * 
 * Rules (from Mary - Behavioral UX):
 * - Never imply blame ("you forgot")
 * - Never imply judgment ("probation tasks")
 * - Never use cartoon gamification ("Great job!" "Success!" "You crushed it!")
 * - Emphasize stability ("I'll help you keep track")
 * - Emphasize relief ("One less thing to worry about")
 * - Emphasize partnership ("I'm here to help")
 */

// ============ ERROR MESSAGES ============

export const ERROR_MESSAGES = {
    // OCR / Document Parsing
    OCR_FAILED: "That was hard to read. Want to try another photo or enter a few details?",
    DOCUMENT_PARSE_FAILED: "I couldn't quite make sense of that document. Mind trying again or adding the details manually?",

    // Voice Recognition
    VOICE_FAILED: "I didn't catch that. You can try again or type it in if easier.",
    VOICE_NOT_SUPPORTED: "Voice input isn't available on this browser. You can type your task instead.",

    // Network / Offline
    OFFLINE: "You're offline, but I saved this. I'll sync it automatically when you're back.",
    NETWORK_ERROR: "Connection issue. Your changes are saved locally — they'll sync when you're back online.",
    SYNC_FAILED: "Couldn't sync right now, but don't worry — I'll try again shortly.",

    // Auth
    LOGIN_FAILED: "Those credentials didn't match. Double-check and try again?",
    SESSION_EXPIRED: "Your session ended. Sign in again to pick up where you left off.",
    GUEST_EXPIRED: "Guest session ended. Create an account to keep things saved next time.",

    // Task Operations
    TASK_CREATE_FAILED: "Couldn't create that task. Want to try again?",
    TASK_UPDATE_FAILED: "Couldn't save that change. Your original is still there.",

    // Calendar
    CALENDAR_CONNECT_FAILED: "Couldn't connect to Google Calendar. Check your permissions and try again.",
    CALENDAR_SYNC_FAILED: "Couldn't add this to your calendar right now. You can try again from Settings.",

    // Generic
    GENERIC_ERROR: "Something went wrong. Give it another try?"
};

// ============ SUCCESS MESSAGES ============

export const SUCCESS_MESSAGES = {
    // Task Completion
    TASK_COMPLETED: "Nice work. That's one less thing on your mind.",
    TASK_COMPLETED_LEGAL: "Nice work. That's one less thing on your mind.",

    // Recurring Task
    RECURRING_CREATED: "Next one scheduled. I'll remind you when it's coming up.",

    // Calendar
    CALENDAR_SYNCED: "Added to your calendar. I'll remind you when it's coming up.",
    CALENDAR_REMOVED: "Removed from your calendar.",

    // Export
    PDF_EXPORTED: "Your tasks have been downloaded.",

    // Account
    ACCOUNT_CREATED: "You're all set. Let's get organized.",
    PROFILE_UPDATED: "Changes saved.",

    // Tags
    TAG_CREATED: "Tag created.",
    TAG_DELETED: "Tag removed."
};

// ============ FIRST-TIME MESSAGES ============

export const FIRST_TIME_MESSAGES = {
    // First Legal Task
    FIRST_LEGAL_TASK: "You're staying on top of important things — I'm here to help you keep it organized.",

    // First Task (Any Purpose)
    FIRST_TASK: "Great start! I'll help you stay on track.",

    // Demo Mode Welcome
    DEMO_WELCOME: "Welcome to Legal Mode. Here's how I help people stay on track with important appointments and deadlines."
};

// ============ PURPOSE LABELS ============

export const PURPOSE_LABELS = {
    legal: {
        label: "Legal Obligations",
        sublabel: "Probation, Court, Appointments",
        description: "Helps you keep track of required appointments and deadlines."
    },
    school: {
        label: "School & Education",
        sublabel: "Classes, Assignments, Exams",
        description: "Stay organized with your academic schedule."
    },
    work: {
        label: "Work & Professional",
        sublabel: "Meetings, Deadlines, Projects",
        description: "Keep your work tasks in order."
    },
    custom: {
        label: "Personal & Custom",
        sublabel: "Life, Goals, Everything Else",
        description: "Organize your life your way."
    }
};

// ============ HELPER FUNCTIONS ============

export function getErrorMessage(key: keyof typeof ERROR_MESSAGES): string {
    return ERROR_MESSAGES[key] || ERROR_MESSAGES.GENERIC_ERROR;
}

export function getSuccessMessage(key: keyof typeof SUCCESS_MESSAGES): string {
    return SUCCESS_MESSAGES[key];
}

export function getPurposeLabel(purpose: string): typeof PURPOSE_LABELS.legal {
    return PURPOSE_LABELS[purpose as keyof typeof PURPOSE_LABELS] || PURPOSE_LABELS.custom;
}
