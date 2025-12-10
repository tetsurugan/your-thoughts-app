import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    children?: ReactNode;
}

export const PrimaryButton = ({ label, children, className = '', ...props }: PrimaryButtonProps) => {
    return (
        <button
            className={`w-full bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
            {...props}
        >
            {children || label}
        </button>
    );
};
