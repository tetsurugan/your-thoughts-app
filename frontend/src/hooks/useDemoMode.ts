import { useEffect, useState, useCallback } from 'react';
import { useApi } from './useApi';
import { isDemoMode, isDemoDataSeeded, markDemoDataSeeded, getDemoTasks, activateDemoMode } from '../utils/demoMode';

/**
 * Hook to handle demo mode activation and data seeding.
 * Checks URL params and seeds demo data if needed.
 */
export function useDemoMode() {
    const api = useApi();
    const [isDemo, setIsDemo] = useState(isDemoMode());
    const [isSeeding, setIsSeeding] = useState(false);

    // Check URL params on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('demo') === 'legal') {
            activateDemoMode();
            setIsDemo(true);
        }
    }, []);

    // Seed demo data if in demo mode and not already seeded
    const seedDemoData = useCallback(async () => {
        if (!isDemo || isDemoDataSeeded() || isSeeding) return;

        setIsSeeding(true);
        try {
            const demoTasks = getDemoTasks();

            for (const task of demoTasks) {
                try {
                    await api.createTaskDirect(task);
                } catch (err) {
                    console.warn('Failed to seed demo task:', task.title, err);
                }
            }

            markDemoDataSeeded();
            console.log('Demo data seeded successfully');
        } catch (error) {
            console.error('Error seeding demo data:', error);
        } finally {
            setIsSeeding(false);
        }
    }, [isDemo, api, isSeeding]);

    // Reset demo data
    const resetDemoData = useCallback(async () => {
        if (!isDemo) return;

        setIsSeeding(true);
        try {
            // Clear existing tasks
            const tasks = await api.getTasks();
            for (const task of tasks) {
                try {
                    await api.deleteTask(task.id);
                } catch (err) {
                    console.warn('Failed to delete task:', task.id, err);
                }
            }

            // Clear seeded flag and reseed
            localStorage.removeItem('demoDataSeeded');
            await seedDemoData();
        } catch (error) {
            console.error('Error resetting demo data:', error);
        } finally {
            setIsSeeding(false);
        }
    }, [isDemo, api, seedDemoData]);

    return {
        isDemo,
        isSeeding,
        seedDemoData,
        resetDemoData
    };
}
