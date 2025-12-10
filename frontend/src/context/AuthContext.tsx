import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string, accountPurpose?: string) => Promise<void>;
    updateUser: (name: string, email: string) => Promise<void>;
    deleteAccount: () => Promise<void>;
    loginAsGuest: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));

    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Login failed');
            }

            const data = await res.json();
            setToken(data.token);
            setUser(data.user);

            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const signup = async (name: string, email: string, password: string, accountPurpose?: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, accountPurpose })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Signup failed');
            }

            const data = await res.json();
            setToken(data.token);
            setUser(data.user);

            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const updateUser = async (name: string, email: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to update profile');
            }

            const updatedUser = await res.json();
            setUser(updatedUser);
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const deleteAccount = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to delete account');
            logout();
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const loginAsGuest = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/auth/guest`, {
                method: 'POST',
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Guest login failed');
            }

            const data = await res.json();
            setToken(data.token);
            setUser(data.user);

            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, signup, logout, updateUser, deleteAccount, loginAsGuest }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
