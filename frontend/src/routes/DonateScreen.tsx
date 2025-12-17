import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Coffee, Rocket, Star } from 'lucide-react';

export const DonateScreen = () => {
    const handleDonate = (amount: number) => {
        // In production, integrate with Stripe, PayPal, etc.
        // For now, open a placeholder or show appreciation
        window.open(`https://buy.stripe.com/test?amount=${amount}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link to="/" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 mb-8">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Support Your Thoughts</h1>
                    <p className="text-slate-600 dark:text-slate-300">
                        Help us keep the app free for people who need it most
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Why Donate?</h2>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            Your Thoughts is built for people who can't afford to forget — individuals with legal obligations,
                            focus challenges, or low digital literacy. Your support helps us:
                        </p>
                        <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                            <li className="flex items-start gap-2">
                                <Star className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                                Keep the app free for those who need it
                            </li>
                            <li className="flex items-start gap-2">
                                <Star className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                                Improve AI capabilities for better task breakdowns
                            </li>
                            <li className="flex items-start gap-2">
                                <Star className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                                Add more accessibility features
                            </li>
                            <li className="flex items-start gap-2">
                                <Star className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
                                Keep servers running reliably
                            </li>
                        </ul>
                    </section>

                    <section className="grid gap-4">
                        <h2 className="text-xl font-semibold">Choose an Amount</h2>

                        <button
                            onClick={() => handleDonate(5)}
                            className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-transparent hover:border-violet-500 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
                                    <Coffee className="w-5 h-5 text-amber-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold">Buy me a coffee</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Small but meaningful</p>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-violet-600">$5</span>
                        </button>

                        <button
                            onClick={() => handleDonate(15)}
                            className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 border-transparent hover:border-violet-500 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors">
                                    <Heart className="w-5 h-5 text-violet-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold">Supporter</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Help someone stay on track</p>
                                </div>
                            </div>
                            <span className="text-xl font-bold text-violet-600">$15</span>
                        </button>

                        <button
                            onClick={() => handleDonate(50)}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl shadow-sm text-white group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Rocket className="w-5 h-5 text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold">Champion</p>
                                    <p className="text-sm text-white/80">Make a real difference</p>
                                </div>
                            </div>
                            <span className="text-xl font-bold">$50</span>
                        </button>
                    </section>

                    <section className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm text-center">
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            Prefer a custom amount or recurring donation?
                        </p>
                        <a
                            href="mailto:donate@yourthoughts.app?subject=I%20want%20to%20support%20Your%20Thoughts"
                            className="inline-flex items-center gap-2 text-violet-600 hover:underline font-medium"
                        >
                            Contact us at donate@yourthoughts.app
                        </a>
                    </section>

                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                        Every contribution helps. Thank you for believing in accessibility. 💜
                    </p>
                </div>
            </div>
        </div>
    );
};
