import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '../lib/storage';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    socialLogin: (provider: 'google' | 'apple') => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = storage.get(STORAGE_KEYS.USER);
        if (storedUser) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const login = async (email: string, _password: string) => {
        setError(null);
        if (!email) {
            setError("Email is required");
            return;
        }
        // Mock login - allow any password for MVP if email matches (or just allow entry)
        const mockUser: User = {
            id: email, // use email as ID for simplicity in MVP
            email,
            name: email.split('@')[0],
        };
        setUser(mockUser);
        storage.set(STORAGE_KEYS.USER, mockUser);
    };

    const signup = async (email: string, _password: string, name: string) => {
        setError(null);
        if (!email || !name) {
            setError("All fields are required");
            return;
        }
        const newUser: User = {
            id: email,
            email,
            name,
        };
        setUser(newUser);
        storage.set(STORAGE_KEYS.USER, newUser);
    };

    const forgotPassword = async (email: string) => {
        setError(null);
        if (!email) {
            setError("Please enter your email address");
            throw new Error("Email required");
        }
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Success
    };

    const socialLogin = async (provider: 'google' | 'apple') => {
        setError(null);
        // Simulate social login delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockSocialUser: User = {
            id: `social_${provider}_user`,
            email: `user@${provider}.com`,
            name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        };
        setUser(mockSocialUser);
        storage.set(STORAGE_KEYS.USER, mockSocialUser);
    };

    const logout = () => {
        setUser(null);
        setError(null);
        storage.remove(STORAGE_KEYS.USER);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, signup, logout, forgotPassword, socialLogin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
