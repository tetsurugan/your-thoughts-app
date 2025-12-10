import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export const EditProfileScreen = () => {
    const { user, updateUser, deleteAccount } = useAuth();
    // Actually, for password change, I need a separate call. AuthContext doesn't have updatePassword yet.
    // I missed adding updatePassword to AuthContext. I should add it or call API directly.
    // Direct API call is fine for this specific screen to keep Context slimmer, but consistency is better.
    // Let's call API directly here for simplicity for the password part, reusing the token.

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'details' | 'password' | 'danger'>('details');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Details Form
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    // Password Form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    const token = localStorage.getItem('auth_token');

    const handleUpdateDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);
        try {
            await updateUser(name, email);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setMessage(null);
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update password');
            }

            setMessage({ type: 'success', text: 'Password changed successfully' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you absolutely sure? This action cannot be undone.')) return;

        setIsLoading(true);
        try {
            await deleteAccount();
            navigate('/login');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-100/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Edit Profile</h1>
            </div>

            <div className="container max-w-lg mx-auto p-4 space-y-6">

                {/* Tabs */}
                <div className="flex p-1 bg-white rounded-xl border border-gray-200">
                    <button
                        onClick={() => { setActiveTab('details'); setMessage(null); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'details' ? 'bg-slate-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Details
                    </button>
                    <button
                        onClick={() => { setActiveTab('password'); setMessage(null); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'password' ? 'bg-slate-100 text-slate-900' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Password
                    </button>
                    <button
                        onClick={() => { setActiveTab('danger'); setMessage(null); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'danger' ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Danger
                    </button>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-center font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} animate-in fade-in slide-in-from-top-2`}>
                        {message.text}
                    </div>
                )}

                {activeTab === 'details' && (
                    <form onSubmit={handleUpdateDetails} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <PrimaryButton disabled={isLoading} type="submit" label={isLoading ? 'Saving...' : 'Save Changes'} />
                    </form>
                )}

                {activeTab === 'password' && (
                    <form onSubmit={handleUpdatePassword} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <PrimaryButton disabled={isLoading} type="submit" label={isLoading ? 'Updating...' : 'Update Password'} />
                    </form>
                )}

                {activeTab === 'danger' && (
                    <div className="bg-red-50 rounded-xl p-6 border border-red-100 space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-100 text-red-600 rounded-full">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-900">Delete Account</h3>
                                <p className="text-red-700 text-sm mt-1">
                                    This will permanently delete your account and all associated data (tasks, folders, settings). This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={isLoading}
                            className="w-full py-4 rounded-xl font-bold bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Deleting...' : 'Delete My Account'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
