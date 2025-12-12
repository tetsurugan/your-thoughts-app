interface CalendarDayProps {
    day: number | null;
    isToday: boolean;
    isSelected: boolean;
    taskCount: number;
    hasOverdue: boolean;
    onClick: () => void;
}

export const CalendarDay = ({ day, isToday, isSelected, taskCount, hasOverdue, onClick }: CalendarDayProps) => {
    if (day === null) {
        return <div className="h-12 sm:h-14" />;
    }

    return (
        <button
            onClick={onClick}
            className={`
                h-12 sm:h-14 w-full flex flex-col items-center justify-center rounded-xl transition-all relative
                ${isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : isToday
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }
            `}
        >
            <span className={`text-sm sm:text-base font-semibold ${isSelected ? 'text-white' : ''}`}>
                {day}
            </span>

            {/* Task indicators */}
            {taskCount > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                    {taskCount <= 3 ? (
                        // Show individual dots for 1-3 tasks
                        [...Array(taskCount)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${isSelected
                                        ? 'bg-white'
                                        : hasOverdue
                                            ? 'bg-red-500'
                                            : 'bg-blue-500'
                                    }`}
                            />
                        ))
                    ) : (
                        // Show count badge for 4+ tasks
                        <span className={`text-xs font-bold ${isSelected
                                ? 'text-white'
                                : hasOverdue
                                    ? 'text-red-500'
                                    : 'text-blue-600 dark:text-blue-400'
                            }`}>
                            {taskCount}
                        </span>
                    )}
                </div>
            )}
        </button>
    );
};
