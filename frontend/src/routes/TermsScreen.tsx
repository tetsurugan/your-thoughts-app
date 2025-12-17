import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, UserCheck, AlertTriangle, Scale } from 'lucide-react';

export const TermsScreen = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link to="/" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

                <div className="space-y-8">
                    <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                                <FileText className="w-5 h-5 text-violet-600" />
                            </div>
                            <h2 className="text-xl font-semibold">Agreement to Terms</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                            By accessing or using Your Thoughts App, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <UserCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-xl font-semibold">Your Responsibilities</h2>
                        </div>
                        <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                            <li>• Use the service for lawful purposes only</li>
                            <li>• Maintain the security of your account</li>
                            <li>• Do not attempt to access other users' data</li>
                            <li>• Respect intellectual property rights</li>
                            <li>• Do not misuse or abuse the AI features</li>
                        </ul>
                    </section>

                    <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                            <h2 className="text-xl font-semibold">Disclaimer</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                            The service is provided "as is" without warranties of any kind. While we strive to keep your data safe and the service reliable, we cannot guarantee 100% uptime or data preservation. Please keep important information backed up.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Scale className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-semibold">Termination</h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                            We reserve the right to terminate or suspend your account at any time for violations of these terms. You may also delete your account at any time through the Settings page.
                        </p>
                    </section>

                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                        Last updated: December 2025 • Questions? <a href="mailto:legal@yourthoughts.app" className="text-violet-600 hover:underline">legal@yourthoughts.app</a>
                    </p>
                </div>
            </div>
        </div>
    );
};
