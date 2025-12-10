import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, Mail, User, Briefcase, GraduationCap, Scale, Sparkles } from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';

const PURPOSE_OPTIONS = [
    { value: 'legal', label: 'Legal Obligations', sublabel: 'Probation, Court, Appointments', icon: Scale, color: 'bg-amber-500' },
    { value: 'school', label: 'School & Education', sublabel: 'Classes, Assignments, Exams', icon: GraduationCap, color: 'bg-blue-500' },
    { value: 'work', label: 'Work & Professional', sublabel: 'Meetings, Deadlines, Projects', icon: Briefcase, color: 'bg-green-500' },
    { value: 'custom', label: 'Personal & Custom', sublabel: 'Life, Goals, Everything Else', icon: Sparkles, color: 'bg-purple-500' },
];

export const SignupScreen = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accountPurpose, setAccountPurpose] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signup(name, email, password, accountPurpose || 'custom');
            navigate('/capture');
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create account</h1>
                    <p className="text-slate-500 dark:text-slate-400">Start organizing your thoughts today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Full Name"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:text-white"
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:text-white"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Account Purpose Selector */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">What will you use this for?</label>
                        <div className="grid grid-cols-2 gap-2">
                            {PURPOSE_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setAccountPurpose(opt.value)}
                                    className={`flex items-start gap-2 p-3 rounded-xl border-2 transition-all text-left ${accountPurpose === opt.value
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                        : 'border-gray-200 dark:border-slate-700 hover:border-blue-300'
                                        }`}
                                >
                                    <div className={`p-1.5 rounded-lg ${opt.color} text-white flex-shrink-0`}>
                                        <opt.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{opt.label}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{opt.sublabel}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg text-center animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    <PrimaryButton
                        type="submit"
                        disabled={loading}
                        className="w-full justify-center text-lg py-3"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </PrimaryButton>
                </form>

                <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
