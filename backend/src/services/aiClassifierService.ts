import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// System folder definitions with keywords and icons
const SYSTEM_FOLDERS = [
    {
        name: 'Probation',
        icon: '⚖️',
        color: '#6366f1',
        keywords: ['po', 'probation', 'parole', 'officer', 'check-in', 'check in', 'supervision', 'conditions']
    },
    {
        name: 'Court',
        icon: '🏛️',
        color: '#ef4444',
        keywords: ['court', 'judge', 'hearing', 'trial', 'arraignment', 'sentencing', 'plea', 'attorney', 'lawyer']
    },
    {
        name: 'Benefits',
        icon: '📋',
        color: '#22c55e',
        keywords: ['benefits', 'snap', 'ebt', 'food stamps', 'medicaid', 'medicare', 'social security', 'ssi', 'ssdi', 'tanf', 'wic', 'unemployment']
    },
    {
        name: 'Housing',
        icon: '🏠',
        color: '#f59e0b',
        keywords: ['housing', 'rent', 'lease', 'apartment', 'shelter', 'section 8', 'voucher', 'landlord', 'eviction', 'move']
    },
    {
        name: 'Work',
        icon: '💼',
        color: '#3b82f6',
        keywords: ['work', 'job', 'interview', 'resume', 'application', 'employer', 'boss', 'shift', 'paycheck', 'income']
    },
    {
        name: 'Programs',
        icon: '📚',
        color: '#8b5cf6',
        keywords: ['class', 'classes', 'program', 'training', 'course', 'school', 'education', 'ged', 'certificate', 'workshop', 'orientation']
    },
    {
        name: 'Health',
        icon: '❤️',
        color: '#ec4899',
        keywords: ['doctor', 'appointment', 'medication', 'prescription', 'therapy', 'counseling', 'mental health', 'clinic', 'hospital']
    },
    {
        name: 'Personal',
        icon: '🌟',
        color: '#64748b',
        keywords: ['family', 'kids', 'children', 'birthday', 'personal', 'home', 'errands']
    }
];

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
 * Ensures system folders exist for a user
 */
export async function ensureSystemFolders(userId: string) {
    for (const folder of SYSTEM_FOLDERS) {
        await prisma.folder.upsert({
            where: {
                userId_name: { userId, name: folder.name }
            },
            update: {},
            create: {
                userId,
                name: folder.name,
                icon: folder.icon,
                color: folder.color,
                isSystem: true
            }
        });
    }
}

/**
 * Assigns a task to folders based on AI classification
 */
export async function assignTaskToFolders(
    taskId: string,
    userId: string,
    content: string
): Promise<FolderMatch[]> {
    // Ensure system folders exist
    await ensureSystemFolders(userId);

    // Classify content
    const matches = classifyContent(content);

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

export { SYSTEM_FOLDERS };
