import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-full border border-gray-200 dark:border-slate-700">
            <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-white shadow text-amber-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                title="Light Mode"
            >
                <Sun className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-full transition-all ${theme === 'system' ? 'bg-white shadow text-blue-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                title="System Theme"
            >
                <Monitor className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-slate-700 shadow text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                title="Dark Mode"
            >
                <Moon className="w-4 h-4" />
            </button>
        </div>
    );
}
