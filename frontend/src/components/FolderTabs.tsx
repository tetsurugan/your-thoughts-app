import { Plus } from 'lucide-react';

interface Folder {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
    taskCount: number;
}

interface FolderTabsProps {
    folders: Folder[];
    selectedFolder: string | null;
    onSelect: (folderId: string | null) => void;
    onCreateFolder?: () => void;
}

export const FolderTabs = ({ folders, selectedFolder, onSelect, onCreateFolder }: FolderTabsProps) => {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {/* All Tasks Tab */}
            <button
                onClick={() => onSelect(null)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all ${selectedFolder === null
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
            >
                All
            </button>

            {/* Folder Pills */}
            {folders.map(folder => (
                <button
                    key={folder.id}
                    onClick={() => onSelect(folder.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${selectedFolder === folder.id
                        ? 'text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                        }`}
                    style={selectedFolder === folder.id ? { backgroundColor: folder.color || '#3b82f6' } : {}}
                >
                    <span>{folder.icon || '📁'}</span>
                    <span>{folder.name}</span>
                    {folder.taskCount > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedFolder === folder.id ? 'bg-white/20' : 'bg-gray-200'
                            }`}>
                            {folder.taskCount}
                        </span>
                    )}
                </button>
            ))}

            {/* Add Custom Folder */}
            {onCreateFolder && (
                <button
                    onClick={onCreateFolder}
                    className="flex-shrink-0 px-3 py-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                    title="Create custom folder"
                >
                    <Plus className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};
