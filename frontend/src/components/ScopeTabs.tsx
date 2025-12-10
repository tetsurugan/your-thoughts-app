import React from 'react';

interface ScopeTabsProps {
    scope: 'today' | 'overdue' | 'upcoming';
    onChange: (scope: 'today' | 'overdue' | 'upcoming') => void;
}

export const ScopeTabs: React.FC<ScopeTabsProps> = ({ scope, onChange }) => {
    const scopes = ['overdue', 'today', 'upcoming'] as const;

    return (
        <div className="flex bg-gray-200 p-1 rounded-lg mb-4">
            {scopes.map(s => (
                <button
                    key={s}
                    onClick={() => onChange(s)}
                    className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-all ${scope === s ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {s}
                </button>
            ))}
        </div>
    );
};
