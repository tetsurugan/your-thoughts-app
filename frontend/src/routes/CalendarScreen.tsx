import { Calendar as CalendarIcon } from 'lucide-react';
import { SecondaryButton } from '../components/SecondaryButton';
import { Link } from 'react-router-dom';

export const CalendarScreen = () => {
    // In a real app we'd fetch events. For MVP spec, show centered state.
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <div className="container px-4 py-8 h-[80vh] flex flex-col justify-center items-center text-center max-w-lg mx-auto">
                <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                    <CalendarIcon className="w-12 h-12 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">No events yet</h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xs mb-8">
                    Add tasks and sync them to your Google Calendar to see them used here.
                </p>

                <Link to="/" className="w-full">
                    <SecondaryButton label="Add a new Task" />
                </Link>
            </div>
        </div>
    );
};
