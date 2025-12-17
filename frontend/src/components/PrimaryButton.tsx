import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    children?: ReactNode;
}

export const PrimaryButton = ({ label, children, className = '', ...props }: PrimaryButtonProps) => {
    return (
        <button
            className={`w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-4 rounded-xl text-lg font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
            {...props}
        >
            {children || label}
        </button>
    );
};
