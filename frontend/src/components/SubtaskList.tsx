import { CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';
import { useApi } from '../hooks/useApi';

interface Subtask {
    id: string;
    label: string;
    done: boolean;
}

interface SubtaskListProps {
    subtasks: Subtask[];
    onUpdate: () => void;
}

export const SubtaskList = ({ subtasks, onUpdate }: SubtaskListProps) => {
    const api = useApi();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleToggle = async (subtask: Subtask) => {
        setLoadingId(subtask.id);
        try {
            await api.toggleSubtask(subtask.id, !subtask.done);
            onUpdate();
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingId(null);
        }
    };

    if (subtasks.length === 0) return null;

    // Sort: done items at bottom
    const sorted = [...subtasks].sort((a, b) => {
        if (a.done === b.done) return 0;
        return a.done ? 1 : -1;
    });

    const progress = Math.round((subtasks.filter(s => s.done).length / subtasks.length) * 100);

    return (
        <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Steps</h4>
                <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    {progress}% Complete
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
                <div
                    className="h-full bg-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="space-y-2">
                {sorted.map(s => (
                    <button
                        key={s.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(s);
                        }}
                        disabled={loadingId === s.id}
                        className={`w-full flex items-start gap-3 p-2 rounded-lg text-left transition-all ${s.done ? 'bg-gray-50 text-gray-400 opacity-80' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                    >
                        <div className={`mt-0.5 transition-colors ${s.done ? 'text-green-500' : 'text-slate-300 group-hover:text-blue-400'
                            }`}>
                            {s.done ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </div>
                        <span className={`text-sm font-medium ${s.done ? 'line-through' : ''}`}>
                            {s.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
