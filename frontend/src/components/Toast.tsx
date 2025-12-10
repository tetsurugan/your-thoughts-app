import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import { X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = 'success', duration?: number) => {
        const id = Math.random().toString(36).substring(7);
        const toastDuration = duration ?? (type === 'error' ? 5000 : 3000);

        setToasts(prev => [...prev, { id, message, type, duration: toastDuration }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
    return (
        <div className="fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
            {toasts.map(toast => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onRemove={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
};

interface ToastItemProps {
    toast: Toast;
    onRemove: () => void;
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
    const [isExiting, setIsExiting] = useState(false);
    const [touchStartY, setTouchStartY] = useState<number | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onRemove, 150);
        }, toast.duration);

        return () => clearTimeout(timer);
    }, [toast.duration, onRemove]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartY === null) return;
        const deltaY = e.touches[0].clientY - touchStartY;
        if (deltaY > 30) {
            setIsExiting(true);
            setTimeout(onRemove, 150);
        }
    };

    const baseClasses = "pointer-events-auto max-w-sm w-full px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 transition-all duration-200";

    const typeClasses = {
        success: "bg-green-600 dark:bg-green-700 text-white",
        error: "bg-red-600 dark:bg-red-700 text-white",
        info: "bg-slate-700 dark:bg-slate-600 text-white"
    };

    const animationClasses = isExiting
        ? "translate-y-4 opacity-0"
        : "translate-y-0 opacity-100 animate-in slide-in-from-bottom-4 fade-in duration-200";

    return (
        <div
            className={`${baseClasses} ${typeClasses[toast.type]} ${animationClasses}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            role="alert"
        >
            <span className="text-sm font-medium">{toast.message}</span>
            <button
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(onRemove, 150);
                }}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Dismiss"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
