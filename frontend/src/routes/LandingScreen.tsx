import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Mic, CheckCircle2, Calendar, Sparkles, ShieldCheck } from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { activateDemoMode } from '../utils/demoMode';

export const LandingScreen = () => {
    const navigate = useNavigate();
    const { loginAsGuest, logout } = useAuth();
    const [isDemoLoading, setIsDemoLoading] = useState(false);
    const demoInitRef = useRef(false);

    // Auto-detect ?demo=legal and trigger guest login with legal purpose
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        // Prevent double firing in StrictMode
        if (params.get('demo') === 'legal' && !demoInitRef.current) {
            demoInitRef.current = true;
            setIsDemoLoading(true);

            // Clear any existing auth and demo flags first
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('demoMode');
            localStorage.removeItem('demoDataSeeded');

            activateDemoMode();
            console.log('[DemoMode] Starting legal demo login...');

            loginAsGuest('legal')
                .then(() => {
                    console.log('[DemoMode] Login successful, redirecting to tasks');
                    navigate('/tasks');
                })
                .catch((error) => {
                    console.error('Demo login failed:', error);
                    setIsDemoLoading(false);
                    demoInitRef.current = false; // Reset on failure
                });
        }
    }, [loginAsGuest, navigate]);

    const handleGuest = async () => {
        try {
            // Demo mode should always use legal persona
            activateDemoMode();
            await loginAsGuest('legal');
            navigate('/capture');
        } catch (error) {
            console.error(error);
        }
    };

    // Show loading while demo mode is initializing
    if (isDemoLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Loading Demo Mode...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col">
            {/* Navigation */}
            <nav className="container mx-auto px-6 py-6 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        Y
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Your Thoughts
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        Sign In
                    </Link>
                    <Link to="/signup" className="hidden sm:block px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 container mx-auto px-4 pt-12 pb-20 flex flex-col items-center justify-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Sparkles className="w-3 h-3" />
                    New: AI Task Breakdown
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    Capture thoughts instantly. <br className="hidden md:block" />
                    <span className="text-blue-600">Organize simply.</span>
                </h1>

                <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
                    Stop losing ideas. Simply speak or type, and our AI organizes everything into tasks, calendar events, and clear next steps.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
                    <Link to="/signup" className="flex-1">
                        <PrimaryButton className="w-full justify-center text-lg py-4 shadow-xl shadow-blue-500/20">
                            Start for Free
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </PrimaryButton>
                    </Link>
                    <button
                        onClick={handleGuest}
                        className="flex-1 px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                        Try Demo Mode
                    </button>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl text-left animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                    <div className="p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm backdrop-blur-sm">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                            <Mic className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Voice First</h3>
                        <p className="text-slate-600 dark:text-slate-400">Speak naturally. We handle the typing, formatting, and sorting for you.</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm backdrop-blur-sm">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Smart Tasks</h3>
                        <p className="text-slate-600 dark:text-slate-400">AI automatically breaks down complex goals into simple, actionable steps.</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm backdrop-blur-sm">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Private & Secure</h3>
                        <p className="text-slate-600 dark:text-slate-400">Your thoughts are yours. Bank-grade encryption keeps your data safe.</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 text-center text-slate-400 text-sm">
                <div className="flex items-center justify-center gap-6 mb-4">
                    <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Privacy</span>
                    <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Terms</span>
                    <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">Contact</span>
                </div>
                <p>© 2025 Your Thoughts App</p>
            </footer>
        </div>
    );
};
