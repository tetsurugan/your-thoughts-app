import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';

export const LoginScreen = () => {
    const { login, loginAsGuest } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/capture');
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-extrabold text-slate-900">Welcome back</h1>
                    <p className="text-slate-500">Sign in to continue to Your Thoughts</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
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
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg text-center animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    <PrimaryButton
                        type="submit"
                        disabled={loading}
                        className="w-full justify-center text-lg py-3"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </PrimaryButton>
                </form>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-slate-50 text-gray-500">Or</span>
                    </div>
                </div>

                {/* Guest Button */}
                <button
                    onClick={async () => {
                        setLoading(true);
                        try {
                            await loginAsGuest();
                            navigate('/capture');
                        } catch (err: any) {
                            setError(err.message);
                            setLoading(false);
                        }
                    }}
                    type="button"
                    disabled={loading}
                    className="w-full py-3 bg-white border border-gray-200 rounded-xl text-slate-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-[0.98]"
                >
                    Continue as Guest
                </button>

                <div className="text-center">
                    <p className="text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
