import { type ButtonHTMLAttributes } from 'react';

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
}

export const SecondaryButton = ({ label, className = '', ...props }: SecondaryButtonProps) => {
    return (
        <button
            className={`w-full border border-gray-400 bg-white text-slate-700 py-4 rounded-xl text-lg font-semibold active:bg-gray-50 transition-all ${className}`}
            {...props}
        >
            {label}
        </button>
    );
};
