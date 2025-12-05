import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '../lib/storage';
import { useAuth } from './AuthContext';
import { type TaskCategory } from '../lib/taskParser';

export type TaskSource = 'typed' | 'voice' | 'photo';

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
}

export interface Task {
    id: string;
    userId: string;
    title: string;
    description: string;
    dueDate: string; // YYYY-MM-DD
    sourceType: TaskSource;
    category: TaskCategory;
    subtasks: Subtask[];
    completed: boolean;
    createdAt: number;
}

interface TaskContextType {
    tasks: Task[];
    addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'completed' | 'subtasks'> & { subtasks?: string[] }) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    toggleTaskCompletion: (id: string) => void;
    toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);

    // Load tasks when user changes
    useEffect(() => {
        if (user) {
            const allTasks = storage.get(STORAGE_KEYS.TASKS) || {};
            const userTasks = allTasks[user.id] || [];
            // Migration: Ensure old tasks have default fields if missing
            const migratedTasks = userTasks.map((t: any) => ({
                ...t,
                category: t.category || 'Personal',
                subtasks: t.subtasks || []
            }));
            setTasks(migratedTasks);
        } else {
            setTasks([]);
        }
    }, [user]);

    // Save tasks whenever they change
    useEffect(() => {
        if (user) {
            const allTasks = storage.get(STORAGE_KEYS.TASKS) || {};
            allTasks[user.id] = tasks;
            storage.set(STORAGE_KEYS.TASKS, allTasks);
        }
    }, [tasks, user]);

    const addTask = (newTaskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'completed' | 'subtasks'> & { subtasks?: string[] }) => {
        if (!user) return;

        // Convert string[] subtasks to Subtask objects
        const subtaskObjects: Subtask[] = (newTaskData.subtasks || []).map(st => ({
            id: crypto.randomUUID(),
            title: st,
            completed: false
        }));

        const newTask: Task = {
            ...newTaskData,
            subtasks: subtaskObjects,
            id: crypto.randomUUID(),
            userId: user.id,
            completed: false,
            createdAt: Date.now(),
        };
        setTasks((prev) => [newTask, ...prev]);
    };

    const updateTask = (id: string, updates: Partial<Task>) => {
        if (!user) return;
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    };

    const deleteTask = (id: string) => {
        if (!user) return;
        setTasks((prev) => prev.filter((t) => t.id !== id));
    };

    const toggleTaskCompletion = (id: string) => {
        if (!user) return;
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
        );
    };

    const toggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
        if (!user) return;
        setTasks((prev) =>
            prev.map((t) => {
                if (t.id !== taskId) return t;
                const newSubtasks = t.subtasks.map(st =>
                    st.id === subtaskId ? { ...st, completed: !st.completed } : st
                );
                // Optional: Auto-complete parent task if all subtasks are done? 
                // For simple MVP logic, we won't force that, kept manual.
                return { ...t, subtasks: newSubtasks };
            })
        );
    };

    return (
        <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, toggleTaskCompletion, toggleSubtaskCompletion }}>
            {children}
        </TaskContext.Provider>
    );
}

export function useTasks() {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
}
