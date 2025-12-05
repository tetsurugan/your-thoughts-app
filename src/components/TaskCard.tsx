import { useState } from 'react';
import { format, isPast, differenceInDays, parseISO } from 'date-fns';
import { CheckCircle2, Circle, Clock, Trash2, Edit2, FileText, Mic, Image as ImageIcon, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import clsx from 'clsx';
import { useTasks, type Task } from '../context/TaskContext';
import { Link } from 'react-router-dom';
import { type TaskCategory } from '../lib/taskParser';

const SourceIcon = ({ type }: { type: Task['sourceType'] }) => {
    switch (type) {
        case 'voice': return <Mic className="w-4 h-4" />;
        case 'photo': return <ImageIcon className="w-4 h-4" />;
        default: return <FileText className="w-4 h-4" />;
    }
};

const CategoryBadge = ({ category }: { category: TaskCategory }) => {
    const colors = {
        'Probation': 'bg-red-100 text-red-800',
        'Legal': 'bg-blue-100 text-blue-800',
        'Appointment': 'bg-green-100 text-green-800',
        'Personal': 'bg-gray-100 text-gray-800'
    };
    return (
        <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", colors[category] || colors['Personal'])}>
            <Tag className="w-3 h-3" />
            {category}
        </span>
    );
};

export default function TaskCard({ task }: { task: Task }) {
    const { toggleTaskCompletion, deleteTask, toggleSubtaskCompletion } = useTasks();
    const [isExpanded, setIsExpanded] = useState(false);
    const dueDate = task.dueDate ? parseISO(task.dueDate) : null;

    const isOverdue = dueDate && isPast(dueDate) && !task.completed;
    const isDueSoon = dueDate && differenceInDays(dueDate, new Date()) <= 3 && !isOverdue && !task.completed;

    return (
        <div className={clsx(
            "bg-white rounded-lg shadow-sm border-l-4 mb-3 transition-all",
            task.completed ? "border-gray-200 opacity-75" :
                isOverdue ? "border-red-500" :
                    isDueSoon ? "border-yellow-500" :
                        "border-primary-500"
        )}>
            <div className="p-4">
                <div className="flex items-start gap-4">
                    <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="mt-1 text-gray-400 hover:text-primary-600 focus:outline-none transition-colors"
                    >
                        {task.completed ?
                            <CheckCircle2 className="w-6 h-6 text-green-500" /> :
                            <Circle className="w-6 h-6" />
                        }
                    </button>

                    <div className="flex-1 min-w-0 pointer-events-auto" onClick={() => setIsExpanded(!isExpanded)}>
                        <div className="flex justify-between items-start">
                            <h3 className={clsx(
                                "text-lg font-semibold truncate pr-2 flex-1",
                                task.completed ? "text-gray-500 line-through" : "text-gray-900"
                            )}>
                                {task.title}
                            </h3>
                            {task.subtasks && task.subtasks.length > 0 && (
                                <button className="text-gray-400">
                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>
                            )}
                        </div>

                        {task.description && (
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                {task.description}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center mt-3 gap-2">
                            <CategoryBadge category={task.category} />

                            <span className={clsx(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                task.sourceType === 'voice' ? "bg-purple-100 text-purple-700" :
                                    task.sourceType === 'photo' ? "bg-indigo-100 text-indigo-700" :
                                        "bg-gray-100 text-gray-700"
                            )}>
                                <SourceIcon type={task.sourceType} />
                                {task.sourceType.charAt(0).toUpperCase() + task.sourceType.slice(1)}
                            </span>

                            {dueDate && (
                                <span className={clsx(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                    isOverdue ? "bg-red-100 text-red-700" :
                                        isDueSoon ? "bg-yellow-100 text-yellow-800" :
                                            "bg-blue-50 text-blue-700"
                                )}>
                                    <Clock className="w-3 h-3" />
                                    {isOverdue ? 'Overdue' : format(dueDate, 'MMM d')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    {task.subtasks && task.subtasks.length > 0 && (
                        <div className="space-y-2 mb-4">
                            <strong className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtasks</strong>
                            {task.subtasks.map(st => (
                                <div key={st.id} className="flex items-center gap-3 pl-2">
                                    <button onClick={() => toggleSubtaskCompletion(task.id, st.id)}>
                                        {st.completed ?
                                            <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                                            <Circle className="w-4 h-4 text-gray-400" />
                                        }
                                    </button>
                                    <span className={clsx("text-sm", st.completed ? "text-gray-400 line-through" : "text-gray-700")}>
                                        {st.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 w-full">
                        <Link
                            to={`/edit/${task.id}`}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors flex items-center gap-1 text-xs"
                        >
                            <Edit2 className="w-4 h-4" /> Edit
                        </Link>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this task?')) {
                                    deleteTask(task.id);
                                }
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex items-center gap-1 text-xs"
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
