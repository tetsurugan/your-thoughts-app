import { useTasks, type Task } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import { PlusCircle, Inbox, Search, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { parseISO, compareAsc } from 'date-fns';

export default function TaskList() {
    const { tasks } = useTasks();
    const { user } = useAuth();
    const [filter, setFilter] = useState('active'); // active, completed
    const [searchQuery, setSearchQuery] = useState('');

    // Sort logic: 
    // 1. Overdue first
    // 2. Due soon (<= 3 days)
    // 3. Due later (sorted by date)
    // 4. No due date (sorted by creation)
    const sortTasks = (taskList: Task[]) => {
        return [...taskList].sort((a, b) => {
            const dateA = a.dueDate ? parseISO(a.dueDate) : null;
            const dateB = b.dueDate ? parseISO(b.dueDate) : null;

            // Prioritize items with due dates
            if (dateA && !dateB) return -1;
            if (!dateA && dateB) return 1;

            if (dateA && dateB) {
                return compareAsc(dateA, dateB);
            }

            // Fallback to creation date (newest first)
            return b.createdAt - a.createdAt;
        });
    };

    const handleVoiceSearch = () => {
        const voiceInput = window.prompt("Simulated Voice Search\n\nSpeak now (type your query):");
        if (voiceInput) {
            setSearchQuery(voiceInput);
        }
    };

    // Filter by search query
    const filteredTasks = tasks.filter(t => {
        const query = searchQuery.toLowerCase();
        if (!query) return true;

        return (
            t.title.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query) ||
            (t.subtasks && t.subtasks.some(st => st.title.toLowerCase().includes(query)))
        );
    });

    const activeTasks = sortTasks(filteredTasks.filter(t => !t.completed));
    const completedTasks = filteredTasks.filter(t => t.completed).sort((a, b) => b.createdAt - a.createdAt);

    const displayedTasks = filter === 'active' ? activeTasks : completedTasks;

    if (!user) return null;

    return (
        <div className="pb-24 pt-4 px-4 bg-gray-50 min-h-screen">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Hello, {user.name}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        You have {activeTasks.length} active tasks
                    </p>
                </div>
                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                </div>
            </header>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        placeholder="Search notes & tasks..."
                        className="block w-full rounded-full border-0 py-3 pl-10 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <button
                        onClick={handleVoiceSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-600 hover:text-primary-700"
                        title="Voice Search"
                    >
                        <Mic className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
                <button
                    onClick={() => setFilter('active')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'active'
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Active
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${filter === 'completed'
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Completed
                </button>
            </div>

            <div className="space-y-4">
                {displayedTasks.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white rounded-xl border border-dashed border-gray-300">
                        {filter === 'active' ? (
                            <>
                                <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <Inbox className="h-6 w-6 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks yet</h3>
                                <p className="text-gray-500 text-sm mb-6">Create a task by typing, speaking, or snapping a photo.</p>
                                <Link
                                    to="/new"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-full font-medium shadow-sm hover:bg-primary-500 transition-colors"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                    Add Task
                                </Link>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mx-auto h-12 w-12 text-gray-200 mb-2" />
                                <p className="text-gray-500">No completed tasks yet.</p>
                            </>
                        )}
                    </div>
                ) : (
                    displayedTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))
                )}
            </div>
        </div>
    );
}

// Helper needed because TaskCard is not exported with CheckCircle2
import { CheckCircle2 } from 'lucide-react';
