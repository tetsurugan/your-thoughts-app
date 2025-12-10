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
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : 'bg-white border-gray-200 text-slate-800 hover:border-blue-300'
                }`}
        >
            <div className={`p-3 rounded-xl ${highlight ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold leading-tight">{label}</h3>
                {sublabel && <p className="text-sm font-medium text-slate-500 mt-1">{sublabel}</p>}
            </div>
        </button>
    );
};
