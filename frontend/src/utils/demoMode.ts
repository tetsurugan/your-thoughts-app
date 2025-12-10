/**
 * Demo Mode Utilities
 * 
 * Handles demo data seeding and management for Legal Mode demo.
 * Activated via ?demo=legal URL param.
 */

// Demo task templates for Legal Mode
export const DEMO_LEGAL_TASKS = [
    {
        title: "PO Check-in with Officer Martinez",
        description: "Monthly probation check-in. Bring ID and proof of address.",
        category: "legal",
        dueAt: getNextWeekday(2), // Tuesday
        isRecurring: true,
        recurrenceInterval: "monthly",
        sourceType: "text"
    },
    {
        title: "Court Hearing - Case #2024-CR-1234",
        description: "Appearance required. Courtroom 3B, 9:00 AM. Dress code: business casual.",
        category: "legal",
        dueAt: getNextWeekday(4), // Thursday
        isRecurring: false,
        sourceType: "text"
    },
    {
        title: "Pay Court Fees - $150",
        description: "Monthly payment due. Can pay online or at clerk's office.",
        category: "legal",
        dueAt: getEndOfMonth(),
        isRecurring: true,
        recurrenceInterval: "monthly",
        sourceType: "text"
    },
    {
        title: "Community Service - Food Bank",
        description: "4 hours remaining. Saturday 9AM-1PM shift available.",
        category: "legal",
        dueAt: getNextWeekday(6), // Saturday
        isRecurring: false,
        sourceType: "text"
    },
    {
        title: "Drug Test Appointment",
        description: "Random testing window. Lab closes at 5pm.",
        category: "legal",
        dueAt: getTomorrow(),
        isRecurring: false,
        sourceType: "text"
    }
];

// Utility functions for date generation
function getNextWeekday(targetDay: number): Date {
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget <= 0) {
        daysUntilTarget += 7;
    }
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntilTarget);
    nextDate.setHours(10, 0, 0, 0);
    return nextDate;
}

function getTomorrow(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    return tomorrow;
}

function getEndOfMonth(): Date {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(17, 0, 0, 0);
    return endOfMonth;
}

// Check if demo mode is active
export function isDemoMode(): boolean {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('demo') === 'legal' || localStorage.getItem('demoMode') === 'legal';
}

// Activate demo mode
export function activateDemoMode(): void {
    localStorage.setItem('demoMode', 'legal');
}

// Deactivate demo mode
export function deactivateDemoMode(): void {
    localStorage.removeItem('demoMode');
    localStorage.removeItem('demoDataSeeded');
}

// Check if demo data has been seeded
export function isDemoDataSeeded(): boolean {
    return localStorage.getItem('demoDataSeeded') === 'true';
}

// Mark demo data as seeded
export function markDemoDataSeeded(): void {
    localStorage.setItem('demoDataSeeded', 'true');
}

// Get demo tasks to seed
export function getDemoTasks() {
    return DEMO_LEGAL_TASKS.map(task => ({
        ...task,
        dueAt: task.dueAt.toISOString()
    }));
}
