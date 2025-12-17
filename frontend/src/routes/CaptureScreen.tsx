import { useState, useRef } from 'react';
import { useApi } from '../hooks/useApi';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Mic, Camera, PenTool, X, CheckCircle2, AlertTriangle, Settings } from 'lucide-react';
import { LargeActionButton } from '../components/LargeActionButton';
import { LoadingMessage } from '../components/LoadingMessage';
import { CategoryIcon } from '../components/CategoryIcon';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { TaskCard } from '../components/TaskCard';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { ERROR_MESSAGES } from '../utils/messages';

type CaptureView = 'home' | 'text' | 'voice' | 'camera_preview' | 'ocr_result' | 'success' | 'loading' | 'confirm_tasks';

interface DetectedTask {
    title: string;
    dueAt?: string;
    category?: string;
    selected?: boolean;
    needsAmPm?: boolean;  // True if time was detected without AM/PM
    isAm?: boolean;       // User's choice: true = AM, false = PM
}

export const CaptureScreen = () => {
    const [view, setView] = useState<CaptureView>('home');
    const [text, setText] = useState('');
    const [recurrenceInterval, setRecurrenceInterval] = useState<string | null>(null);
    const [ocrResult, setOcrResult] = useState<any>(null); // { task, text }
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();
    const api = useApi();
    const { showToast } = useToast();
    const [detectedTasks, setDetectedTasks] = useState<DetectedTask[]>([]);

    const { tasks, fetchTasks } = useTasks();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = tasks.filter(t => {
        if (!t.dueAt || t.status === 'completed') return false;
        return new Date(t.dueAt) < today;
    });

    const todayTasks = tasks.filter(t => {
        if (t.status === 'completed') return false;
        if (!t.dueAt) return true; // No due date = today/backlog
        const d = new Date(t.dueAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    });

    // Handlers
    const handleVoiceStart = () => {
        // Check for basic support (doesn't guarantee permission, but filters out completely unsupported)
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            showToast(ERROR_MESSAGES.VOICE_NOT_SUPPORTED, 'error');
            return;
        }
        setText('');
        setView('voice');
    };

    const handleVoiceComplete = (capturedText: string) => {
        setText(capturedText);
        setView('text'); // Go to text view for review
    };

    const handleCameraClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setView('camera_preview');
        try {
            const { documentId, key } = await api.uploadDocument(file);
            const result = await api.parseDocument(documentId, key);
            setOcrResult(result);
            setView('ocr_result');
        } catch (err) {
            console.error(err);
            showToast(ERROR_MESSAGES.OCR_FAILED, 'error');
            setView('home');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSubmitText = async () => {
        if (!text.trim()) return;
        setView('loading');
        try {
            // First, detect if there are multiple tasks
            const result = await api.detectTasks(text);
            const tasks = result.tasks || [];

            if (tasks.length > 1) {
                // Multiple tasks detected - show confirmation
                // Check which tasks need AM/PM clarification
                setDetectedTasks(tasks.map((t: DetectedTask) => {
                    let needsAmPm = false;
                    let isAm = true; // default to AM
                    if (t.dueAt) {
                        const hour = new Date(t.dueAt).getHours();
                        // If hour is between 1-12 and original text didn't have am/pm, needs clarification
                        // We detect this by checking if hour matches a simple number pattern
                        needsAmPm = hour >= 1 && hour <= 12;
                    }
                    return { ...t, selected: true, needsAmPm, isAm };
                }));
                setView('confirm_tasks');
            } else {
                // Single task - create directly
                await api.createTaskFromIntent(
                    text,
                    'text',
                    recurrenceInterval ? { isRecurring: true, recurrenceInterval } : undefined
                );
                handleSuccess();
            }
        } catch (err) {
            console.error(err);
            showToast(ERROR_MESSAGES.TASK_CREATE_FAILED, 'error');
            setView('text');
        }
    };

    const handleConfirmTasks = async () => {
        const selectedTasks = detectedTasks.filter(t => t.selected);
        if (selectedTasks.length === 0) {
            setView('text');
            return;
        }

        setView('loading');
        try {
            for (const task of selectedTasks) {
                await api.createTaskDirect({
                    title: task.title,
                    category: task.category || 'personal',
                    dueAt: task.dueAt,
                    sourceType: 'text'
                });
            }
            handleSuccess();
        } catch (err) {
            console.error(err);
            showToast(ERROR_MESSAGES.TASK_CREATE_FAILED, 'error');
            setView('text');
        }
    };

    const toggleTaskSelection = (index: number) => {
        setDetectedTasks(prev => prev.map((t, i) =>
            i === index ? { ...t, selected: !t.selected } : t
        ));
    };

    const updateTaskTitle = (index: number, newTitle: string) => {
        setDetectedTasks(prev => prev.map((t, i) =>
            i === index ? { ...t, title: newTitle } : t
        ));
    };

    const toggleAmPm = (index: number) => {
        setDetectedTasks(prev => prev.map((t, i) => {
            if (i !== index || !t.dueAt) return t;
            const date = new Date(t.dueAt);
            const hours = date.getHours();
            // Toggle between AM and PM by adding/subtracting 12 hours
            if (t.isAm) {
                // Currently AM, switch to PM
                date.setHours(hours < 12 ? hours + 12 : hours);
            } else {
                // Currently PM, switch to AM
                date.setHours(hours >= 12 ? hours - 12 : hours);
            }
            return { ...t, dueAt: date.toISOString(), isAm: !t.isAm };
        }));
    };

    const handleSuccess = () => {
        setView('success');
        setText('');
        setRecurrenceInterval(null);
        setOcrResult(null);
        // Refresh task list after creating a task
        fetchTasks();
        setTimeout(() => setView('home'), 2500);
    };

    // Sub-renders
    if (view === 'success') {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
                <div className="container h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Got it!</h2>
                    <p className="text-xl text-slate-600">Saved to your list.</p>
                </div>
            </div>
        );
    }

    if (view === 'loading' || view === 'camera_preview') {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
                <LoadingMessage message={view === 'loading' ? "Saving your task..." : "Reading document..."} />
            </div>
        );
    }

    if (view === 'ocr_result' && ocrResult) {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
                <div className="container px-4 py-6 pb-24">
                    <h2 className="text-2xl font-bold mb-6">Found this:</h2>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 mb-6">
                        <div className="flex items-start gap-4">
                            <CategoryIcon category={ocrResult.task.category} />
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{ocrResult.task.title}</h3>
                                {ocrResult.task.dueAt && <p className="text-violet-600 font-medium mt-1">Due: {format(new Date(ocrResult.task.dueAt), 'MMM d, h:mm a')}</p>}
                            </div>
                        </div>
                        <p className="mt-4 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-sm">
                            "{ocrResult.task.description.split('Original Text:')[0]}"
                        </p>
                    </div>
                    <div className="space-y-4">
                        <PrimaryButton label="Add this Task" onClick={handleSuccess} />
                        <SecondaryButton label="Cancel" onClick={() => setView('home')} />
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'voice') {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
                <VoiceRecorder
                    onClose={() => setView('home')}
                    onComplete={handleVoiceComplete}
                />

                {/* Background (blurred out) */}
                <div className="container h-[80vh] flex flex-col items-center justify-center p-6 text-center opacity-30 pointer-events-none">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Listening...</h2>
                </div>
            </div>
        );
    }

    if (view === 'text') {
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
                <div className="container px-4 py-6 pb-32 flex flex-col min-h-screen">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">New Note</h2>
                        <button onClick={() => setView('home')} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full"><X className="w-6 h-6 text-gray-500 dark:text-gray-400" /></button>
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type here..."
                        className="flex-1 w-full p-5 text-xl rounded-2xl border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900 resize-y mb-6 shadow-sm min-h-[50vh]"
                        autoFocus
                    />
                    <div className="flex justify-between items-center mb-6 sticky bottom-6 bg-slate-100 dark:bg-slate-950 p-4 rounded-xl shadow-lg border border-gray-100 dark:border-slate-800 z-10">
                        <select
                            value={recurrenceInterval || ''}
                            onChange={(e) => setRecurrenceInterval(e.target.value || null)}
                            className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm px-3 py-2 outline-none focus:border-violet-500"
                        >
                            <option value="">No Repeat</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                        <PrimaryButton label="Create Task" onClick={handleSubmitText} disabled={!text.trim()} />
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'confirm_tasks') {
        const selectedCount = detectedTasks.filter(t => t.selected).length;
        return (
            <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
                <div className="container px-4 py-6 pb-32">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Found {detectedTasks.length} Tasks
                        </h2>
                        <button onClick={() => setView('text')} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full">
                            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        I found multiple tasks in your note. Select the ones you want to create:
                    </p>

                    <div className="space-y-4 mb-8">
                        {detectedTasks.map((task, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-xl border-2 transition-all ${task.selected
                                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Selection checkbox */}
                                    <button
                                        onClick={() => toggleTaskSelection(index)}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-2 flex-shrink-0 ${task.selected
                                            ? 'border-violet-500 bg-violet-500'
                                            : 'border-gray-300 dark:border-slate-600'
                                            }`}
                                    >
                                        {task.selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </button>

                                    <div className="flex-1 space-y-3">
                                        {/* Editable title */}
                                        <input
                                            type="text"
                                            value={task.title}
                                            onChange={(e) => updateTaskTitle(index, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full font-semibold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-violet-500 focus:outline-none py-1 px-0"
                                        />

                                        <div className="flex flex-wrap items-center gap-2">
                                            {task.category && (
                                                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">
                                                    {task.category}
                                                </span>
                                            )}

                                            {/* Time display with AM/PM toggle */}
                                            {task.dueAt && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-violet-600 dark:text-violet-400">
                                                        Due: {format(new Date(task.dueAt), 'h:mm')}
                                                    </span>
                                                    {task.needsAmPm && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toggleAmPm(index); }}
                                                            className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                                                        >
                                                            {task.isAm ? 'AM' : 'PM'} ⇄
                                                        </button>
                                                    )}
                                                    {!task.needsAmPm && (
                                                        <span className="text-xs text-violet-600 dark:text-violet-400">
                                                            {format(new Date(task.dueAt), 'a')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="sticky bottom-6 space-y-3">
                        <PrimaryButton
                            label={`Create ${selectedCount} Task${selectedCount !== 1 ? 's' : ''}`}
                            onClick={handleConfirmTasks}
                            disabled={selectedCount === 0}
                        />
                        <SecondaryButton label="Back to Edit" onClick={() => setView('text')} />
                    </div>
                </div>
            </div>
        );
    }

    // HOME VIEW
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <div className="container px-4 py-8 pb-32 max-w-lg mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm uppercase tracking-wide">Welcome Back</p>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{user?.name?.split(' ')[0] || 'Friend'}</h1>
                    </div>
                    <Link to="/settings" className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-sm text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400">
                        <Settings className="w-6 h-6" />
                    </Link>
                </header>

                {/* Main Actions */}
                <div className="mb-10 space-y-4">
                    <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">What's on your mind? I'll help you take care of it.</h2>
                    <LargeActionButton
                        icon={<Mic className="w-8 h-8" />}
                        label="Say it out loud"
                        sublabel="I'll handle the details"
                        onClick={handleVoiceStart}
                        highlight
                    />

                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <LargeActionButton
                        icon={<Camera className="w-8 h-8" />}
                        label="Take a photo"
                        sublabel="I'll read it for you"
                        onClick={handleCameraClick}
                    />

                    <LargeActionButton
                        icon={<PenTool className="w-8 h-8" />}
                        label="Type something quick"
                        sublabel="Messy is fine"
                        onClick={() => setView('text')}
                    />
                </div>

                {/* Glance Section */}
                <div>
                    {(overdueTasks.length > 0 || todayTasks.length > 0) && <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-4">At a Glance</h2>}

                    <div className="space-y-4">
                        {overdueTasks.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                                <div className="bg-red-100 p-2 rounded-full text-red-600"><AlertTriangle className="w-6 h-6" /></div>
                                <div>
                                    <p className="font-bold text-red-800 text-lg">Here's what needs attention</p>
                                    <p className="text-red-600 text-sm font-medium">You've got this — {overdueTasks.length} item{overdueTasks.length > 1 ? 's' : ''} to check</p>
                                </div>
                            </div>
                        )}

                        {todayTasks.slice(0, 3).map(task => (
                            <TaskCard key={task.id} task={task} onRefresh={fetchTasks} onToggle={() => { }} />
                            // Note: toggling on home view might require a refetch wrapper or just link to tasks
                            // For MVP, we display card. If clicked, maybe go to details? 
                            // Using TaskCard is good for consistency. 
                        ))}

                        {/* Show simple empty state if nothing */}
                        {todayTasks.length === 0 && overdueTasks.length === 0 && (
                            <div className="text-center py-8 text-slate-400">
                                <p>Nothing urgent right now. You're doing great!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
