export const STORAGE_KEYS = {
    USER: 'clarity_user',
    TASKS: 'clarity_tasks',
};

export const storage = {
    get: (key: string) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from storage', e);
            return null;
        }
    },
    set: (key: string, value: any) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error writing to storage', e);
        }
    },
    remove: (key: string) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from storage', e);
        }
    },
};
