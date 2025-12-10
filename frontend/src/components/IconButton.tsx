import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode;
    label: string;
}

export const IconButton = ({ icon, label, className = '', ...props }: IconButtonProps) => {
    return (
        <button
            className={`inline-flex items-center gap-2 text-blue-600 font-medium active:text-blue-800 transition-colors ${className}`}
            {...props}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
};
