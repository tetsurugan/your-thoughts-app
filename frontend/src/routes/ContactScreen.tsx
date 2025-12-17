import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle } from 'lucide-react';

export const ContactScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would send to a backend
        // For now, open mailto
        const subject = encodeURIComponent(`Contact from ${name}`);
        const body = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`);
        window.location.href = `mailto:hello@yourthoughts.app?subject=${subject}&body=${body}`;
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link to="/" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <h1 className="text-3xl font-bold mb-8">Contact Us</h1>

                {submitted ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Message Ready!</h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            Your email app should have opened. If not, you can reach us at:
                        </p>
                        <a href="mailto:hello@yourthoughts.app" className="text-violet-600 hover:underline font-medium">
                            hello@yourthoughts.app
                        </a>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                                    <MessageSquare className="w-5 h-5 text-violet-600" />
                                </div>
                                <h2 className="text-xl font-semibold">We'd Love to Hear From You</h2>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 mb-6">
                                Have questions, feedback, or just want to say hi? Fill out the form below and we'll get back to you as soon as possible.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none"
                                        placeholder="What's on your mind?"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                    Send Message
                                </button>
                            </form>
                        </section>

                        <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-semibold">Direct Email</h2>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300">
                                Prefer to email directly? Reach us at{' '}
                                <a href="mailto:hello@yourthoughts.app" className="text-violet-600 hover:underline">
                                    hello@yourthoughts.app
                                </a>
                            </p>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};
