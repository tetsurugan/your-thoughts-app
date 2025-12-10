import { NavLink } from 'react-router-dom';
import { Mic, ListTodo, Calendar } from 'lucide-react';

export const TabBar = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 pb-safe-nav pt-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center h-16">
                <NavLink
                    to="/"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-24 rounded-xl transition-all ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    <Mic className={`w-7 h-7 mb-1 ${({ isActive }: any) => isActive ? 'fill-blue-100 dark:fill-blue-900/30' : ''}`} />
                    <span className="text-xs font-bold">Capture</span>
                </NavLink>

                <NavLink
                    to="/tasks"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-24 rounded-xl transition-all ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    <ListTodo className="w-7 h-7 mb-1" />
                    <span className="text-xs font-bold">Tasks</span>
                </NavLink>

                <NavLink
                    to="/calendar"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-24 rounded-xl transition-all ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                    <Calendar className="w-7 h-7 mb-1" />
                    <span className="text-xs font-bold">Calendar</span>
                </NavLink>
            </div>
        </nav>
    );
};
