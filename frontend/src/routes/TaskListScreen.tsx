import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useFolders } from '../hooks/useFolders';
import { useApi } from '../hooks/useApi';
import { useSync } from '../hooks/useSync';
import { useToast } from '../components/Toast';
import { TaskCard } from '../components/TaskCard';
import { ActionableTaskCard } from '../components/ActionableTaskCard';
import { FolderTabs } from '../components/FolderTabs';
import { DemoBadge } from '../components/DemoBadge';
import { AlertCircle, Calendar, CalendarDays, FileDown } from 'lucide-react';
import { exportTasksToPDF } from '../utils/exportToPDF';
import { isDemoMode } from '../utils/demoMode';
import { SUCCESS_MESSAGES } from '../utils/messages';

export const TaskListScreen = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
    const { tasks, loading, fetchTasks } = useTasks();
    const { isOnline, isSyncing } = useSync(); // Now using isOnline from useSync for real-time status

    // Filter tasks locally since we are caching everything
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueTasks = tasks.filter(t => {
        if (!t.dueAt || t.status === 'completed') return false;
        return new Date(t.dueAt) < today;
    });

    const todayTasks = tasks.filter(t => {
        if (t.status === 'completed') return false; // Show completed? Maybe in future logic
        if (!t.dueAt) return true; // No due date = today/backlog
        const d = new Date(t.dueAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    });

    const upcomingTasks = tasks.filter(t => {
        if (!t.dueAt || t.status === 'completed') return false;
        const d = new Date(t.dueAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() > today.getTime();
    });

    // Completed tasks filter
    const completedTasks = tasks.filter(t => t.status === 'completed');

    const { folders, selectedFolder, setSelectedFolder } = useFolders();
    const api = useApi();
    const { showToast } = useToast();

    const handleToggle = async (id: string) => {
        const t = tasks.find(x => x.id === id);
        if (!t) return;
        // Optimistic update could go here, but for now wait for API/Queue
        const newStatus = t.status === 'completed' ? 'pending' : 'completed';

        try {
            await api.updateTask(id, { status: newStatus });
            // Show completion toast if completing
            if (newStatus === 'completed') {
                showToast(SUCCESS_MESSAGES.TASK_COMPLETED, 'success');
            }
            // For offline mode, the manual fetchTasks might not see the change if backend didn't update.
            // But since we are likely just queuing, we depend on the queue or optimistic state.
            // For MVP, just refetch. If offline, it might not change IDB yet unless we update IDB optimistically.
            // Let's rely on fetchTasks for now.
            fetchTasks();
        } catch (e) {
            // If it was queued (offline), we should probably manually update the local state or IDB to reflect 'pending sync'?
            // The useApi throws 'OFFLINE_QUEUED' maybe?
            // For now, let's just trigger a re-render.
            fetchTasks();
        }
    };

    // Refetch wrapper
    const refetchAll = () => fetchTasks();

    const [searchQuery, setSearchQuery] = useState('');

    // Filter tasks based on search or tabs
    const filteredBySearch = tasks.filter(t => {
        if (!searchQuery) return false;
        const q = searchQuery.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
    });

    const currentList = searchQuery
        ? filteredBySearch
        : (activeTab === 'all'
            ? tasks.filter(t => t.status !== 'completed')  // All pending tasks
            : activeTab === 'today'
                ? todayTasks
                : activeTab === 'upcoming'
                    ? upcomingTasks
                    : completedTasks);
    // Loading is global now
    const isLoading = loading;


    const displayList = currentList;

    const handleExportPDF = () => {
        exportTasksToPDF(tasks, `tasks-${new Date().toISOString().split('T')[0]}`);
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <div className="container max-w-lg mx-auto px-4 py-8 pb-32">
                {/* Offline Banner */}
                {!isOnline && (
                    <div className="bg-amber-100 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 mb-4">
                        <span className="text-sm font-medium flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            You are offline
                        </span>
                        {isSyncing ? (
                            <span className="text-xs font-bold animate-pulse">Syncing...</span>
                        ) : (
                            <span className="text-xs">Changes saved locally</span>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Tasks</h1>
                        {isDemoMode() && <DemoBadge />}
                    </div>
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        title="Export to PDF"
                    >
                        <FileDown className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6 relative">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                {/* Smart Folder Tabs - Hide if Searching */}
                {!searchQuery && (
                    <div className="mb-6">
                        <FolderTabs
                            folders={folders}
                            selectedFolder={selectedFolder}
                            onSelect={setSelectedFolder}
                        />
                    </div>
                )}

                {/* Overdue Section - Always Top if Exists and not searching (or maybe show in search results?) */}
                {/* For simplicity, if searching, just show flat list. If not searching, show sections. */}
                {overdueTasks.length > 0 && !selectedFolder && !searchQuery && (
                    <div className="mb-8 animate-in slide-in-from-top duration-300">
                        <div className="flex items-center gap-2 mb-3 text-red-700 font-bold px-1">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-lg">Needs attention ({overdueTasks.length})</span>
                        </div>
                        <div className="space-y-4">
                            {overdueTasks.map(t => <TaskCard key={t.id} task={t} onToggle={handleToggle} onRefresh={refetchAll} />)}
                        </div>
                    </div>
                )}

                {/* Tabs - hide when folder is selected OR searching */}
                {!selectedFolder && !searchQuery && (
                    <div className="flex p-1 bg-gray-200 dark:bg-slate-800 rounded-xl mb-6">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveTab('today')}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'today' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'upcoming' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all ${activeTab === 'completed' ? 'bg-white dark:bg-slate-700 shadow-sm text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Done
                        </button>
                    </div>
                )}

                {/* Folder Name Header */}
                {selectedFolder && !searchQuery && (
                    <h2 className="text-xl font-bold text-slate-700 mb-4">
                        {folders.find(f => f.id === selectedFolder)?.icon} {folders.find(f => f.id === selectedFolder)?.name}
                    </h2>
                )}

                {/* List */}
                {isLoading ? (
                    <div className="text-center py-10 text-gray-400">Loading...</div>
                ) : displayList.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center opacity-60">
                        {searchQuery ? (
                            <p className="text-lg font-medium text-gray-500">No matching tasks found.</p>
                        ) : (
                            <>
                                {activeTab === 'today' ? <Calendar className="w-16 h-16 text-gray-300 mb-4" /> : <CalendarDays className="w-16 h-16 text-gray-300 mb-4" />}
                                <p className="text-xl font-medium text-gray-500">Nothing here yet — you're all set!</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayList.map(t => (
                            <ActionableTaskCard
                                key={t.id}
                                task={t}
                                onToggle={handleToggle}
                                onRefresh={refetchAll}
                                onDelete={async (taskId) => {
                                    try {
                                        await api.deleteTask(taskId);
                                        showToast('Task deleted', 'success');
                                        fetchTasks();
                                    } catch (error) {
                                        console.error('Failed to delete task:', error);
                                        showToast('Failed to delete task', 'error');
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
