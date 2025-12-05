import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { FileText, Mic, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { parseTask } from '../lib/taskParser';

type TabType = 'typed' | 'voice' | 'photo';

export default function NewNote() {
    const [activeTab, setActiveTab] = useState<TabType>('typed');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [error, setError] = useState('');
    const [showUncertainty, setShowUncertainty] = useState(false);
    const [pendingNote, setPendingNote] = useState<{ desc: string, date: string } | null>(null);

    const { addTask } = useTasks();
    const navigate = useNavigate();

    const handleValidation = (desc: string) => {
        if (!desc.trim()) {
            setError('This field cannot be empty. Please enter your note.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSimulatedUncertainty = (desc: string) => {
        // Simple rule: if note is very short (< 5 chars) but not empty, ask availability
        // Or if it contains ambiguous words like "maybe", "book" (could be read or schedule)
        // For MVP demo, lets check for the word "book" as a trigger.
        if (desc.toLowerCase().includes('book') && !showUncertainty) {
            setPendingNote({ desc, date: dueDate });
            setShowUncertainty(true);
            return true;
        }
        return false;
    };

    const processSubmission = (desc: string, date: string) => {
        const parsed = parseTask(desc);

        addTask({
            title: parsed.title,
            description: desc, // Keep original full text as description
            dueDate: date || '',
            sourceType: activeTab,
            category: parsed.category,
            subtasks: parsed.subtasks
        });

        navigate('/');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!handleValidation(description)) return;
        if (handleSimulatedUncertainty(description)) return;

        processSubmission(description, dueDate);
    };

    const resolveUncertainty = (choice: string) => {
        if (!pendingNote) return;
        const newDesc = choice === 'read'
            ? `Read book: ${pendingNote.desc}`
            : `Book appointment: ${pendingNote.desc}`;

        processSubmission(newDesc, pendingNote.date);
    };

    const tabs = [
        { id: 'typed', label: 'Typed', icon: FileText },
        { id: 'voice', label: 'Voice', icon: Mic },
        { id: 'photo', label: 'Photo', icon: ImageIcon },
    ] as const;

    if (showUncertainty) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Uncertainty Detected</h3>
                    <p className="text-gray-500 mb-6">I wasn't sure what you meant by "book".</p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => resolveUncertainty('read')}
                            className="w-full bg-primary-50 text-primary-700 py-3 rounded-md font-medium hover:bg-primary-100"
                        >
                            Did you mean "Read a book"?
                        </button>
                        <button
                            onClick={() => resolveUncertainty('schedule')}
                            className="w-full bg-primary-50 text-primary-700 py-3 rounded-md font-medium hover:bg-primary-100"
                        >
                            Did you mean "Book an appointment"?
                        </button>
                        <button
                            onClick={() => setShowUncertainty(false)}
                            className="w-full text-gray-400 py-2 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 pb-20">
            <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <h1 className="text-xl font-bold text-gray-900 text-center">New Note</h1>
            </div>

            <div className="flex border-b border-gray-200 bg-white">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => {
                            setActiveTab(id);
                            setDescription('');
                            setDueDate('');
                            setError('');
                        }}
                        className={clsx(
                            "flex-1 py-4 text-center font-medium text-sm flex flex-col items-center gap-1 border-b-2 transition-colors",
                            activeTab === id
                                ? "border-primary-600 text-primary-600 bg-primary-50/50"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        )}
                    >
                        <Icon className="w-5 h-5" />
                        {label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 p-4 bg-white">
                <div className="space-y-6">
                    {activeTab === 'voice' && (
                        <div className="bg-purple-50 p-4 rounded-lg text-sm text-purple-800 border border-purple-100 mb-4">
                            <strong>Simulated Voice Mode:</strong> Type your note below as if you were speaking. It will be tagged as a voice note.
                        </div>
                    )}

                    {activeTab === 'photo' && (
                        <div className="space-y-4 mb-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:border-primary-500 transition-colors cursor-pointer bg-gray-50">
                                <ImageIcon className="w-10 h-10 mb-2" />
                                <span className="text-sm">Tap to take photo or upload</span>
                                <input type="file" accept="image/*" className="hidden" />
                            </div>
                            <p className="text-sm text-gray-600 px-1">Describe what's in the photo:</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="description" className="sr-only">Note Content</label>
                        <textarea
                            id="description"
                            rows={activeTab === 'photo' ? 4 : 8}
                            className={clsx(
                                "block w-full rounded-md border-0 py-3 px-3 text-gray-900 ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 text-lg",
                                error ? "ring-red-300 focus:ring-red-500" : "ring-gray-300"
                            )}
                            placeholder={
                                activeTab === 'typed' ? "Type your instructions here..." :
                                    activeTab === 'voice' ? "Review transcribed text..." :
                                        "E.g. Pay the utility bill shown in the picture..."
                            }
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                if (error) setError('');
                            }}
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date (Optional)
                        </label>
                        <input
                            type="date"
                            id="dueDate"
                            className="block w-full rounded-md border-0 py-3 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center items-center gap-2 rounded-md bg-primary-600 py-3 px-4 text-lg font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                        <Check className="w-5 h-5" />
                        Create Task
                    </button>
                </div>
            </form>
        </div>
    );
}
