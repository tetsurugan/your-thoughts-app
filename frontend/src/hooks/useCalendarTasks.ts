import { useMemo } from 'react';
import { useTasks } from './useTasks';

interface CalendarTask {
    id: string;
    title: string;
    dueAt: string;
    status: string;
    category?: string;
}

interface DayTasks {
    [dateKey: string]: CalendarTask[];
}

/**
 * Hook for organizing tasks by calendar dates
 */
export function useCalendarTasks() {
    const { tasks, loading, error, refetch } = useTasks('all');

    // Get all tasks that have a due date
    const tasksWithDueDate = useMemo(() => {
        return tasks.filter(t => t.dueAt != null) as CalendarTask[];
    }, [tasks]);

    // Group tasks by date key (YYYY-MM-DD)
    const tasksByDate = useMemo(() => {
        const grouped: DayTasks = {};

        tasksWithDueDate.forEach(task => {
            const date = new Date(task.dueAt);
            const dateKey = formatDateKey(date);

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(task);
        });

        // Sort tasks within each day by time
        Object.keys(grouped).forEach(key => {
            grouped[key].sort((a, b) =>
                new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
            );
        });

        return grouped;
    }, [tasksWithDueDate]);

    // Get tasks for a specific date
    const getTasksForDate = (date: Date): CalendarTask[] => {
        const dateKey = formatDateKey(date);
        return tasksByDate[dateKey] || [];
    };

    // Get all days in a month that have tasks
    const getDaysWithTasks = (year: number, month: number): Set<number> => {
        const days = new Set<number>();

        tasksWithDueDate.forEach(task => {
            const date = new Date(task.dueAt);
            if (date.getFullYear() === year && date.getMonth() === month) {
                days.add(date.getDate());
            }
        });

        return days;
    };

    // Check if a specific date has overdue tasks
    const hasOverdueTasks = (date: Date): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        if (checkDate >= today) return false;

        const dayTasks = getTasksForDate(date);
        return dayTasks.some(t => t.status !== 'completed');
    };

    return {
        tasks: tasksWithDueDate,
        tasksByDate,
        loading,
        error,
        refetch,
        getTasksForDate,
        getDaysWithTasks,
        hasOverdueTasks
    };
}

// Helper to format date as YYYY-MM-DD
function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper to get calendar grid for a month
export function getCalendarDays(year: number, month: number): (number | null)[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days: (number | null)[] = [];

    // Add empty cells for days before the 1st
    for (let i = 0; i < startDayOfWeek; i++) {
        days.push(null);
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    return days;
}

// Helper to format month name
export function getMonthName(month: number): string {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
}
