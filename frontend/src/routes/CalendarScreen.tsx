import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { useCalendarTasks, getCalendarDays, getMonthName } from '../hooks/useCalendarTasks';
import { CalendarDay } from '../components/CalendarDay';
import { useApi } from '../hooks/useApi';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarScreen = () => {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState<Date>(today);

    const { getTasksForDate, getDaysWithTasks, hasOverdueTasks, loading, refetch } = useCalendarTasks();
    const api = useApi();

    // Get calendar grid for current month
    const calendarDays = useMemo(() =>
        getCalendarDays(currentYear, currentMonth),
        [currentYear, currentMonth]
    );

    // Get days that have tasks
    const daysWithTasks = useMemo(() =>
        getDaysWithTasks(currentYear, currentMonth),
        [getDaysWithTasks, currentYear, currentMonth]
    );

    // Get tasks for selected date
    const selectedDateTasks = useMemo(() =>
        getTasksForDate(selectedDate),
        [getTasksForDate, selectedDate]
    );

    // Navigate months
    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(y => y - 1);
        } else {
            setCurrentMonth(m => m - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(y => y + 1);
        } else {
            setCurrentMonth(m => m + 1);
        }
    };

    const goToToday = () => {
        setCurrentYear(today.getFullYear());
        setCurrentMonth(today.getMonth());
        setSelectedDate(today);
    };

    // Handle day click
    const handleDayClick = (day: number) => {
        setSelectedDate(new Date(currentYear, currentMonth, day));
    };

    // Toggle task completion
    const handleToggleTask = async (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        await api.updateTask(taskId, { status: newStatus });
        refetch();
    };

    // Check if a day is today
    const isToday = (day: number) =>
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

    // Check if a day is selected
    const isSelected = (day: number) =>
        day === selectedDate.getDate() &&
        currentMonth === selectedDate.getMonth() &&
        currentYear === selectedDate.getFullYear();

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <div className="container max-w-lg mx-auto px-4 py-6 pb-32">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        Calendar
                    </h1>
                    <button
                        onClick={goToToday}
                        className="px-3 py-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                        Today
                    </button>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        {getMonthName(currentMonth)} {currentYear}
                    </h2>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm mb-6">
                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {WEEKDAYS.map(day => (
                            <div
                                key={day}
                                className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            const taskCount = day ? (daysWithTasks.has(day) ? getTasksForDate(new Date(currentYear, currentMonth, day)).length : 0) : 0;
                            const hasOverdue = day ? hasOverdueTasks(new Date(currentYear, currentMonth, day)) : false;

                            return (
                                <CalendarDay
                                    key={index}
                                    day={day}
                                    isToday={day !== null && isToday(day)}
                                    isSelected={day !== null && isSelected(day)}
                                    taskCount={taskCount}
                                    hasOverdue={hasOverdue}
                                    onClick={() => day && handleDayClick(day)}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Selected Date Tasks */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">
                            {format(selectedDate, 'EEEE, MMMM d')}
                        </h3>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-500">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            Loading...
                        </div>
                    ) : selectedDateTasks.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                            <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="font-medium">No tasks scheduled</p>
                            <p className="text-sm">Tasks with due dates will appear here</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {selectedDateTasks.map(task => {
                                const isCompleted = task.status === 'completed';
                                const dueTime = format(new Date(task.dueAt), 'h:mm a');

                                return (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                    >
                                        <button
                                            onClick={() => handleToggleTask(task.id, task.status)}
                                            className="flex-shrink-0"
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                            ) : (
                                                <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600 hover:text-blue-500 transition-colors" />
                                            )}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium truncate ${isCompleted
                                                    ? 'text-slate-400 line-through'
                                                    : 'text-slate-800 dark:text-slate-200'
                                                }`}>
                                                {task.title}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {dueTime}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
