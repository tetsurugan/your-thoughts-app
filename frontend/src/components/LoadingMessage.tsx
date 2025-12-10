import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingMessageProps {
    message: string;
}

export const LoadingMessage: React.FC<LoadingMessageProps> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-slate-700">{message}</p>
        </div>
    );
};
