import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Trash2 } from 'lucide-react';

export const PrivacyScreen = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link to="/" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

                <div className="space-y-8">
                    <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                                <Shield className="w-5 h-5 text-violet-600" />
                            </div>
                            <h2 className="text-xl font-semibold">Your Privacy Matters</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                            Your Thoughts App is built with privacy at its core. We believe your thoughts, tasks, and personal information belong to you — not advertisers or data brokers.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Lock className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-xl font-semibold">Data We Collect</h2>
                        </div>
                        <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                            <li>• <strong>Account info:</strong> Email and name (if you sign up)</li>
                            <li>• <strong>Tasks:</strong> The tasks you create to provide the service</li>
                            <li>• <strong>Voice data:</strong> Processed locally, never stored on our servers</li>
                        </ul>
                    </section>

                    <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Eye className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-semibold">What We Don't Do</h2>
                        </div>
                        <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                            <li>• We never sell your data to third parties</li>
                            <li>• We don't show you targeted ads</li>
                            <li>• We don't share your tasks with anyone</li>
                            <li>• We don't track you across other websites</li>
                        </ul>
                    </section>

                    <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <h2 className="text-xl font-semibold">Your Rights</h2>
                        </div>
                        <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                            <li>• Delete your account and all data at any time</li>
                            <li>• Export your tasks in PDF format</li>
                            <li>• Request a copy of your data</li>
                        </ul>
                    </section>

                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                        Questions? Contact us at <a href="mailto:privacy@yourthoughts.app" className="text-violet-600 hover:underline">privacy@yourthoughts.app</a>
                    </p>
                </div>
            </div>
        </div>
    );
};
