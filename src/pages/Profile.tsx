import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4 safe-area-bottom pb-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    <User className="h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                    {user.isGuest ? (
                        <p className="text-primary-600 font-medium">Guest Account</p>
                    ) : (
                        <p className="text-gray-500">{user.email}</p>
                    )}
                </div>
            </div>

            {user.isGuest && (
                <div className="bg-primary-50 rounded-lg p-4 mb-6 border border-primary-100">
                    <p className="text-sm text-primary-800">
                        You are currently using a limited guest account. Your data is saved on this device only.
                        <span className="font-semibold block mt-1">Sign up to sync your tasks across devices!</span>
                    </p>
                </div>
            )}

            <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100 overflow-hidden">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 p-4 text-red-600 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>

                <div className="p-4 text-center">
                    <p className="text-xs text-gray-400">Your Thoughts App v1.0.0</p>
                </div>
            </div>
        </div>
    );
}
