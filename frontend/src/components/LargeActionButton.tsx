import { type ReactNode } from 'react';

interface LargeActionButtonProps {
    icon: ReactNode;
    label: string;
    sublabel?: string; // Optional context
    onClick: () => void;
    highlight?: boolean;
}

export const LargeActionButton = ({ icon, label, sublabel, onClick, highlight = false }: LargeActionButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`w-full p-6 rounded-xl shadow-sm border active:scale-[0.98] transition-all flex items-center gap-5 text-left
                ${highlight
                    ? 'bg-violet-50 border-violet-200 text-violet-900 dark:bg-violet-900/30 dark:border-violet-700 dark:text-violet-100'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-violet-300 dark:hover:border-violet-600'
                }`}
        >
            <div className={`p-3 rounded-xl ${highlight ? 'bg-violet-200 text-violet-700 dark:bg-violet-800 dark:text-violet-300' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold leading-tight">{label}</h3>
                {sublabel && <p className="text-sm font-medium text-slate-500 mt-1">{sublabel}</p>}
            </div>
        </button>
    );
};
