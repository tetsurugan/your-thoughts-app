import { AlertTriangle } from 'lucide-react';

interface DemoBadgeProps {
    className?: string;
}

export const DemoBadge = ({ className = '' }: DemoBadgeProps) => {
    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 bg-amber-500/90 text-white text-xs font-bold rounded-full shadow-sm ${className}`}>
            <AlertTriangle className="w-3 h-3" />
            <span>DEMO DATA</span>
        </div>
    );
};
