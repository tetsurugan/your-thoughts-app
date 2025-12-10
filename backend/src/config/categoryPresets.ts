/**
 * Category Presets by Account Purpose
 * 
 * Maps User.accountPurpose to recommended categories and tags.
 * Used by AI classifier to bias category selection based on user context.
 */

export const CATEGORY_PRESETS_BY_PURPOSE: Record<string, {
    categories: string[];
    defaultTags: { name: string; color?: string }[];
}> = {
    legal: {
        categories: ['legal', 'court', 'appointment', 'document', 'program'],
        defaultTags: [
            { name: 'Court Date', color: '#EF4444' },
            { name: 'PO Meeting', color: '#F59E0B' },
            { name: 'Program/Class', color: '#8B5CF6' },
            { name: 'Document Due', color: '#3B82F6' },
            { name: 'Lawyer', color: '#6366F1' },
            { name: 'Transportation', color: '#10B981' }
        ]
    },
    school: {
        categories: ['assignment', 'exam', 'project', 'reading', 'class'],
        defaultTags: [
            { name: 'Homework', color: '#3B82F6' },
            { name: 'Exam', color: '#EF4444' },
            { name: 'Project', color: '#8B5CF6' },
            { name: 'Reading', color: '#10B981' },
            { name: 'Study Group', color: '#F59E0B' }
        ]
    },
    work: {
        categories: ['meeting', 'deadline', 'follow_up', 'review', 'presentation'],
        defaultTags: [
            { name: 'Meeting', color: '#3B82F6' },
            { name: 'Deadline', color: '#EF4444' },
            { name: 'Follow-up', color: '#F59E0B' },
            { name: 'Review', color: '#8B5CF6' },
            { name: 'Client', color: '#10B981' }
        ]
    },
    custom: {
        categories: ['personal', 'health', 'finance', 'other'],
        defaultTags: []
    }
};

/**
 * Get category bias for AI classification based on account purpose
 */
export function getCategoryBiasForPurpose(purpose: string | null | undefined): string[] {
    if (!purpose || !CATEGORY_PRESETS_BY_PURPOSE[purpose]) {
        return CATEGORY_PRESETS_BY_PURPOSE.custom.categories;
    }
    return CATEGORY_PRESETS_BY_PURPOSE[purpose].categories;
}

/**
 * Get default tags to seed for a new user based on their account purpose
 */
export function getDefaultTagsForPurpose(purpose: string | null | undefined): { name: string; color?: string }[] {
    if (!purpose || !CATEGORY_PRESETS_BY_PURPOSE[purpose]) {
        return [];
    }
    return CATEGORY_PRESETS_BY_PURPOSE[purpose].defaultTags;
}
