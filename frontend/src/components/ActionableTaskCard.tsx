import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Trash2, CheckCircle2 } from 'lucide-react';
import { TaskCard } from './TaskCard';

interface ActionableTaskCardProps {
    task: any;
    onToggle: (id: string, newStatus?: string) => void;
    onDelete?: (id: string) => void;
    onRefresh?: () => void;
}

export const ActionableTaskCard = ({ task, onToggle, onDelete, onRefresh }: ActionableTaskCardProps) => {
    const [offset, setOffset] = useState(0);

    const handlers = useSwipeable({
        onSwiping: (event) => {
            // Limit swipe distance
            if (Math.abs(event.deltaX) < 150) {
                setOffset(event.deltaX);
            }
        },
        onSwipedLeft: (event) => {
            if (event.deltaX < -100) {
                // Trigger Delete/Archive
                if (window.confirm('Delete this task?')) {
                    if (onDelete) onDelete(task.id);
                }
            }
            setOffset(0);
        },
        onSwipedRight: (event) => {
            if (event.deltaX > 100) {
                // Trigger Complete
                onToggle(task.id);
            }
            setOffset(0);
        },
        onSwiped: () => {
            setOffset(0);
        },
        trackMouse: true
    });



    return (
        <div className="relative overflow-hidden rounded-xl mb-4 select-none touch-pan-y" {...handlers}>
            {/* Background Actions */}
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
                {/* Left Background (Complete) - Visible when swiping Right */}
                <div
                    className={`flex items-center justify-start pl-6 h-full w-full bg-green-500 transition-opacity ${offset > 0 ? 'opacity-100' : 'opacity-0'}`}
                >
                    <CheckCircle2 className="text-white w-8 h-8" />
                </div>

                {/* Right Background (Delete) - Visible when swiping Left */}
                <div
                    className={`flex items-center justify-end pr-6 h-full w-full bg-red-500 transition-opacity ${offset < 0 ? 'opacity-100' : 'opacity-0'}`}
                >
                    <Trash2 className="text-white w-8 h-8" />
                </div>
            </div>

            {/* Foreground Card */}
            <div
                className="relative bg-white dark:bg-slate-800 rounded-xl transition-transform duration-200 ease-out"
                style={{ transform: `translateX(${offset}px)` }}
            >
                <TaskCard task={task} onToggle={(id) => onToggle(id)} onRefresh={onRefresh} />
            </div>
        </div>
    );
};
