import { useState } from 'react';
import {
    Sparkles,
    CheckCircle2,
    Circle,
    Pencil,
    Save,
    X,
    ChevronUp,
    ChevronDown,
    AlertCircle,
    Volume2,
    VolumeX,
    Repeat
} from 'lucide-react';
import { format } from 'date-fns';
import { useApi } from '../hooks/useApi';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { CategoryIcon } from './CategoryIcon';
import { IconButton } from './IconButton';
import { SubtaskList } from './SubtaskList';
import { useToast } from './Toast';

interface TaskCardProps {
    task: {
        id: string;
        title: string;
        description?: string;
        category: string;
        status: string;
        dueAt?: string;
        googleEventId?: string | null;
        subtasks?: { id: string; label: string; done: boolean }[];
        isRecurring?: boolean;
        recurrenceInterval?: string | null;
    };
    onToggle: (id: string) => void;
    onRefresh?: () => void;
}

export const TaskCard = ({ task, onToggle, onRefresh }: TaskCardProps) => {
    const isCompleted = task.status === 'completed';
    const isOverdue = task.dueAt && new Date(task.dueAt) < new Date() && !isCompleted;
    const api = useApi();
    const { showToast } = useToast();
    const { speak, stop } = useTextToSpeech();
    const [isReading, setIsReading] = useState(false);
    const [addingToCal, setAddingToCal] = useState(false);
    const [removingFromCal, setRemovingFromCal] = useState(false);
    const [calSuccess, setCalSuccess] = useState(!!task.googleEventId);
    const [isBreakingDown, setIsBreakingDown] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showSubtasks, setShowSubtasks] = useState(true); // Default to true so newly broken down tasks are visible
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDueAt, setEditDueAt] = useState(task.dueAt || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleReadAloud = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isReading) {
            stop();
            setIsReading(false);
        } else {
            speak(task.title);
            setIsReading(true);
            setTimeout(() => setIsReading(false), Math.max(2000, task.title.length * 80));
        }
    };

    const handleAddToCalendar = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (addingToCal || calSuccess) return;
        setAddingToCal(true);
        try {
            await api.addTaskToCalendar(task.id);
            setCalSuccess(true);
        } catch (err) {
            console.error(err);
            alert("Let's connect your calendar first — check Settings when you're ready.");
        } finally {
            setAddingToCal(false);
        }
    };

    const handleRemoveFromCalendar = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (removingFromCal || !calSuccess) return;
        setRemovingFromCal(true);
        try {
            await api.removeTaskFromCalendar(task.id);
            setCalSuccess(false);
        } catch (err) {
            console.error(err);
            alert("Hmm, that didn't work. We can try again whenever you're ready.");
        } finally {
            setRemovingFromCal(false);
        }
    };

    const handleBreakdown = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isBreakingDown) return;
        setIsBreakingDown(true);
        try {
            const result = await api.breakdownTask(task.id);
            if (!result.subtasks || result.subtasks.length === 0) {
                showToast("This task is already simple enough - no breakdown needed!", 'info');
            }
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error(err);
            showToast("Couldn't break down this task. Try rephrasing it or breaking it down manually.", 'error');
        } finally {
            setIsBreakingDown(false);
        }
    };

    const handleStartEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditTitle(task.title);
        setEditDueAt(task.dueAt ? new Date(task.dueAt).toISOString().slice(0, 16) : '');
        setIsEditing(true);
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(false);
    };

    const handleSaveEdit = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!editTitle.trim()) return;
        setIsSaving(true);
        try {
            await api.updateTask(task.id, {
                title: editTitle.trim(),
                dueAt: editDueAt ? new Date(editDueAt).toISOString() : null
            });
            setIsEditing(false);

            // Immediate refresh for the edit itself
            if (onRefresh) onRefresh();

            // Delayed refresh to catch AI-generated subtasks (runs in background)
            setTimeout(() => {
                if (onRefresh) onRefresh();
            }, 3000);
        } catch (err) {
            console.error(err);
            alert('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const isLegal = task.category === 'legal';

    return (
        <div className={`p-4 rounded-2xl transition-all duration-300 ${isLegal ? 'border-l-4 border-l-amber-500' : ''} ${isCompleted ? 'bg-slate-50 dark:bg-slate-900/50 opacity-75' : 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700'}`}>
            <div className="flex items-start gap-3">
                <button
                    onClick={() => onToggle(task.id)}
                    className={`mt-1 transition-colors ${isCompleted ? 'text-green-500' : 'text-slate-300 dark:text-slate-600 hover:text-green-500'}`}
                >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 text-lg font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 focus:border-violet-500 focus:outline-none"
                                autoFocus
                            />
                        ) : (
                            <h3 className={`text-lg font-semibold truncate pr-2 ${isCompleted ? 'text-slate-500 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                                {task.title}
                            </h3>
                        )}
                        <div className="flex items-center gap-1 flex-shrink-0">
                            {!isCompleted && !isEditing && (
                                <button
                                    onClick={handleStartEdit}
                                    className="p-1.5 rounded-full transition-colors text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30"
                                    title="Edit task"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={handleReadAloud}
                                className={`p-1.5 rounded-full transition-colors ${isReading ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' : 'text-gray-400 hover:text-violet-500'}`}
                                title={isReading ? 'Stop reading' : 'Read aloud'}
                            >
                                {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {task.description && (
                        <p className={`text-sm mt-1 line-clamp-2 ${isCompleted ? 'text-slate-400 dark:text-slate-600' : 'text-slate-600 dark:text-slate-300'}`}>
                            {task.description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs text-slate-600 dark:text-slate-300 font-medium">
                            <CategoryIcon category={task.category} className="w-3 h-3" />
                            <span className="capitalize">{task.category}</span>
                        </div>

                        {task.isRecurring && (
                            <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded text-xs font-medium">
                                <Repeat className="w-3 h-3" />
                                <span className="capitalize">{task.recurrenceInterval}</span>
                            </div>
                        )}

                        {task.dueAt && !isEditing && (
                            <span className={`text-xs font-medium flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'}`}>
                                {isOverdue && <AlertCircle className="w-3 h-3" />}
                                Due: {format(new Date(task.dueAt), 'MMM d, h:mm a')}
                            </span>
                        )}
                    </div>

                    {/* Edit mode: date picker */}
                    {isEditing && (
                        <div className="mt-3 space-y-3">
                            <div>
                                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Due Date & Time</label>
                                <input
                                    type="datetime-local"
                                    value={editDueAt}
                                    onChange={(e) => setEditDueAt(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full text-sm bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1.5 focus:border-violet-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={isSaving || !editTitle.trim()}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700 disabled:opacity-50"
                                >
                                    {isSaving ? (
                                        <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                                    ) : (
                                        <Save className="w-3 h-3" />
                                    )}
                                    Save
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                                >
                                    <X className="w-3 h-3" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Actions Row */}
                    {!isCompleted && (
                        <div className="pt-3 flex flex-wrap gap-2 items-center">
                            {task.dueAt && (
                                calSuccess ? (
                                    <>
                                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">
                                            Added to calendar
                                        </span>
                                        <button
                                            onClick={handleRemoveFromCalendar}
                                            disabled={removingFromCal}
                                            className="text-xs font-medium text-red-600 hover:text-red-700 underline"
                                        >
                                            Remove
                                        </button>
                                    </>
                                ) : (
                                    <IconButton
                                        icon={addingToCal ? <div className="animate-spin w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full" /> : <div className="text-sm font-bold">📅 Add to calendar</div>}
                                        label=""
                                        onClick={handleAddToCalendar}
                                        className="text-sm"
                                        disabled={addingToCal}
                                    />
                                )
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4 mt-2">
                        {!hasSubtasks ? (
                            <button
                                onClick={handleBreakdown}
                                className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors"
                                disabled={isBreakingDown}
                            >
                                {isBreakingDown ? (
                                    <div className="animate-spin w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                                ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                )}
                                {isBreakingDown ? 'Thinking...' : 'Break this down'}
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowSubtasks(!showSubtasks); }}
                                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                {showSubtasks ? (
                                    <>
                                        <ChevronUp className="w-3.5 h-3.5" />
                                        Hide steps
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-3.5 h-3.5" />
                                        Show {task.subtasks?.length} steps
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Subtasks Section */}
                    {hasSubtasks && showSubtasks && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                            <SubtaskList subtasks={task.subtasks!} onUpdate={onRefresh || (() => { })} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

