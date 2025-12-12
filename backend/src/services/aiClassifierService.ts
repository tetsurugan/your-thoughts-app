import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Purpose-specific folder definitions
const FOLDERS_BY_PURPOSE: Record<string, Array<{ name: string; icon: string; color: string; keywords: string[] }>> = {
    legal: [
        { name: 'Probation', icon: '⚖️', color: '#6366f1', keywords: ['po', 'probation', 'parole', 'officer', 'check-in', 'supervision'] },
        { name: 'Court', icon: '🏛️', color: '#ef4444', keywords: ['court', 'judge', 'hearing', 'trial', 'attorney', 'lawyer'] },
        { name: 'Benefits', icon: '📋', color: '#22c55e', keywords: ['benefits', 'snap', 'ebt', 'medicaid', 'ssi', 'unemployment'] },
        { name: 'Housing', icon: '🏠', color: '#f59e0b', keywords: ['housing', 'rent', 'lease', 'apartment', 'shelter', 'section 8'] },
        { name: 'Programs', icon: '📚', color: '#8b5cf6', keywords: ['class', 'program', 'training', 'course', 'workshop'] },
        { name: 'Health', icon: '❤️', color: '#ec4899', keywords: ['doctor', 'medication', 'therapy', 'counseling', 'clinic'] },
        { name: 'Personal', icon: '🌟', color: '#64748b', keywords: ['family', 'personal', 'home', 'errands'] }
    ],
    school: [
        { name: 'Classes', icon: '📚', color: '#3b82f6', keywords: ['class', 'lecture', 'professor', 'teacher', 'attendance'] },
        { name: 'Assignments', icon: '📝', color: '#ef4444', keywords: ['homework', 'assignment', 'essay', 'paper', 'due', 'submit'] },
        { name: 'Exams', icon: '✏️', color: '#f59e0b', keywords: ['exam', 'test', 'quiz', 'midterm', 'final', 'study'] },
        { name: 'Projects', icon: '🎯', color: '#8b5cf6', keywords: ['project', 'presentation', 'group', 'research'] },
        { name: 'Activities', icon: '⚽', color: '#22c55e', keywords: ['club', 'sport', 'practice', 'meeting', 'event'] },
        { name: 'Personal', icon: '🌟', color: '#64748b', keywords: ['personal', 'home', 'family', 'errands'] }
    ],
    work: [
        { name: 'Meetings', icon: '👥', color: '#3b82f6', keywords: ['meeting', 'call', 'standup', 'sync', '1:1', 'team'] },
        { name: 'Deadlines', icon: '⏰', color: '#ef4444', keywords: ['deadline', 'due', 'deliver', 'ship', 'launch'] },
        { name: 'Projects', icon: '🎯', color: '#8b5cf6', keywords: ['project', 'feature', 'milestone', 'sprint'] },
        { name: 'Admin', icon: '📋', color: '#f59e0b', keywords: ['expense', 'timesheet', 'review', 'report', 'hr'] },
        { name: 'Learning', icon: '📚', color: '#22c55e', keywords: ['training', 'course', 'certification', 'learn'] },
        { name: 'Personal', icon: '🌟', color: '#64748b', keywords: ['personal', 'home', 'family', 'errands'] }
    ],
    custom: [
        { name: 'Tasks', icon: '✅', color: '#3b82f6', keywords: ['task', 'todo', 'do'] },
        { name: 'Events', icon: '📅', color: '#8b5cf6', keywords: ['event', 'appointment', 'meeting'] },
        { name: 'Ideas', icon: '💡', color: '#f59e0b', keywords: ['idea', 'thought', 'note'] },
        { name: 'Personal', icon: '🌟', color: '#64748b', keywords: ['personal', 'home', 'family', 'errands'] }
    ]
};

// Get folders for a specific purpose (fallback to custom)
function getFoldersForPurpose(purpose: string) {
    return FOLDERS_BY_PURPOSE[purpose] || FOLDERS_BY_PURPOSE['custom'];
}

// Legacy: Keep SYSTEM_FOLDERS for backward compatibility (defaults to legal)
const SYSTEM_FOLDERS = FOLDERS_BY_PURPOSE['legal'];

interface FolderMatch {
    name: string;
    confidence: number;
    icon: string;
    color: string;
}

/**
 * Classifies content and returns matching folders with confidence scores
 */
export function classifyContent(text: string): FolderMatch[] {
    const lowerText = text.toLowerCase();
    const matches: FolderMatch[] = [];

    for (const folder of SYSTEM_FOLDERS) {
        let matchCount = 0;
        let totalKeywords = folder.keywords.length;

        for (const keyword of folder.keywords) {
            if (lowerText.includes(keyword)) {
                matchCount++;
            }
        }

        if (matchCount > 0) {
            // Confidence = ratio of matched keywords, min 0.3 for any match
            const confidence = Math.max(0.3, matchCount / Math.min(totalKeywords, 3));
            matches.push({
                name: folder.name,
                confidence: Math.min(confidence, 1.0),
                icon: folder.icon,
                color: folder.color
            });
        }
    }

    // Sort by confidence descending
    matches.sort((a, b) => b.confidence - a.confidence);

    // If no matches, default to Personal
    if (matches.length === 0) {
        const personal = SYSTEM_FOLDERS.find(f => f.name === 'Personal')!;
        matches.push({
            name: personal.name,
            confidence: 0.5,
            icon: personal.icon,
            color: personal.color
        });
    }

    return matches;
}

/**
 * Ensures system folders exist for a user (based on their account purpose)
 */
/**
 * Ensures system folders exist for a user (based on their account purpose)
 */
export async function ensureSystemFolders(userId: string, accountPurpose?: string) {
    const purpose = accountPurpose || 'custom';
    console.log(`[FolderSeeding] START for User ${userId}, Purpose: ${purpose}`);

    const folders = getFoldersForPurpose(purpose);
    console.log(`[FolderSeeding] Found ${folders.length} folders to seed: ${folders.map(f => f.name).join(', ')}`);

    for (const folder of folders) {
        try {
            await prisma.folder.upsert({
                where: {
                    userId_name: { userId, name: folder.name }
                },
                update: {}, // Don't overwrite if exists
                create: {
                    userId,
                    name: folder.name,
                    icon: folder.icon,
                    color: folder.color,
                    isSystem: true
                }
            });
            console.log(`[FolderSeeding] Ensured folder '${folder.name}'`);
        } catch (e: any) {
            console.error(`[FolderSeeding] Failed to upsert folder '${folder.name}':`, e);
        }
    }
    console.log(`[FolderSeeding] COMPLETE for User ${userId}`);
}

/**
 * Assigns a task to folders based on AI classification
 */
export async function assignTaskToFolders(
    taskId: string,
    userId: string,
    content: string
): Promise<FolderMatch[]> {
    // Fetch user's account purpose
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { accountPurpose: true }
    });
    const purpose = user?.accountPurpose || 'custom';

    // Ensure system folders exist for this purpose
    await ensureSystemFolders(userId, purpose);

    // Classify content using purpose-specific folders
    const purposeFolders = getFoldersForPurpose(purpose);
    const matches = classifyContentWithFolders(content, purposeFolders);

    // Get folder IDs
    const folderNames = matches.map(m => m.name);
    const folders = await prisma.folder.findMany({
        where: {
            userId,
            name: { in: folderNames }
        }
    });

    // Create task-folder relationships
    for (const match of matches) {
        const folder = folders.find(f => f.name === match.name);
        if (folder) {
            await prisma.taskFolder.upsert({
                where: {
                    taskId_folderId: { taskId, folderId: folder.id }
                },
                update: { confidence: match.confidence },
                create: {
                    taskId,
                    folderId: folder.id,
                    confidence: match.confidence
                }
            });
        }
    }

    return matches;
}

/**
 * Classifies content against a specific folder set
 */
function classifyContentWithFolders(text: string, folders: typeof SYSTEM_FOLDERS): FolderMatch[] {
    const lowerText = text.toLowerCase();
    const matches: FolderMatch[] = [];

    for (const folder of folders) {
        let matchCount = 0;
        let totalKeywords = folder.keywords.length;

        for (const keyword of folder.keywords) {
            if (lowerText.includes(keyword)) {
                matchCount++;
            }
        }

        if (matchCount > 0) {
            const confidence = Math.max(0.3, matchCount / Math.min(totalKeywords, 3));
            matches.push({
                name: folder.name,
                confidence: Math.min(confidence, 1.0),
                icon: folder.icon,
                color: folder.color
            });
        }
    }

    matches.sort((a, b) => b.confidence - a.confidence);

    if (matches.length === 0) {
        const personal = folders.find(f => f.name === 'Personal') || folders[0];
        matches.push({
            name: personal.name,
            confidence: 0.5,
            icon: personal.icon,
            color: personal.color
        });
    }

    return matches;
}

export { SYSTEM_FOLDERS };
