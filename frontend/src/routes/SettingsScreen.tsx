import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { Calendar, CheckCircle2, LogOut, User, Smartphone, Bell, Tags } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { TagManager } from '../components/TagManager';

const NotificationsSection = () => {
    const { isSubscribed, subscribe, loading, permission, sendTestNotification } = useNotifications();

    const handleToggle = async () => {
        if (!isSubscribed) {
            await subscribe();
        }
    };

    return (
        <div className={`w-full bg-white rounded-xl border p-6 shadow-sm transition-all border-gray-200`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${isSubscribed ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                        <Bell className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <p className="text-lg font-bold text-slate-900">Reminders</p>
                        <p className={`text-sm ${isSubscribed ? 'text-indigo-700' : 'text-slate-500'}`}>
                            {isSubscribed ? 'Active' : permission === 'denied' ? 'Notifications blocked' : 'Get alerts for important tasks'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleToggle}
                    disabled={isSubscribed || loading || permission === 'denied'}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${isSubscribed
                        ? 'bg-green-100 text-green-700'
                        : permission === 'denied'
                            ? 'bg-red-50 text-red-400 cursor-not-allowed'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                >
                    {loading ? '...' : isSubscribed ? 'On' : 'Turn On'}
                </button>
            </div>

            {isSubscribed && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                        onClick={sendTestNotification}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
                    >
                        Send test notification
                    </button>
                </div>
            )}
        </div>
    );
};

export const SettingsScreen = () => {
    const api = useApi();
    const { user, logout } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [showTags, setShowTags] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/calendar/status');
                const data = await res.json();
                setIsConnected(data.connected);
            } catch {
                setIsConnected(false);
            }
        };
        checkStatus();
    }, []);

    const handleConnect = () => {
        api.connectGoogleCalendar();
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
            <div className="container max-w-lg mx-auto px-4 py-8 pb-32">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Settings</h1>

                {/* User Section */}
                <section className="mb-6">
                    <h2 className="text-lg font-bold text-slate-700 mb-3 ml-1">Account</h2>
                    <Link to="/settings/profile" className="block">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between shadow-sm hover:bg-slate-50 transition-colors cursor-pointer active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-900">{user?.name || 'Guest'}</p>
                                    <p className="text-slate-500">{user?.email || 'Not logged in'}</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold text-slate-600">
                                Edit
                            </div>
                        </div>
                    </Link>
                </section>

                {/* Personalization */}
                <section className="mb-6">
                    <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">Personalization</h2>
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 shadow-sm">
                        <button
                            onClick={() => setShowTags(!showTags)}
                            className="w-full flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400">
                                    <Tags className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-slate-900 dark:text-slate-200">Manage Tags</span>
                            </div>
                            <span className="text-slate-500 dark:text-slate-400 text-sm">{showTags ? 'Hide' : 'Show'}</span>
                        </button>
                        {showTags && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                                <TagManager />
                            </div>
                        )}
                    </div>
                </section>

                {/* Integrations */}
                <section className="mb-6">
                    <h2 className="text-lg font-bold text-slate-700 mb-3 ml-1">Integrations</h2>
                    <div className="space-y-4">
                        <button
                            onClick={handleConnect}
                            disabled={isConnected}
                            className={`w-full bg-white rounded-xl border p-6 flex items-center justify-between shadow-sm transition-all ${isConnected ? 'border-green-200 bg-green-50' : 'border-gray-200 active:scale-[0.98]'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${isConnected ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-lg font-bold text-slate-900">Google Calendar</p>
                                    <p className={`text-sm ${isConnected ? 'text-green-700' : 'text-slate-500'}`}>
                                        {isConnected ? 'Connected & Syncing' : 'Tap to connect'}
                                    </p>
                                </div>
                            </div>
                            {isConnected && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                        </button>

                        <NotificationsSection />
                    </div>
                </section>

                {/* Appearance */}
                <section className="mb-6">
                    <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">Appearance</h2>
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-slate-200">Theme</span>
                        </div>
                        <ThemeToggle />
                    </div>
                </section>

                {/* App Info */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">App Info</h2>
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                            <span className="font-medium">Version 1.0.0</span>
                        </div>
                    </div>
                </section>

                <button
                    onClick={logout}
                    className="w-full py-4 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-bold bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    Log Out
                </button>
            </div>
        </div>
    );
};
