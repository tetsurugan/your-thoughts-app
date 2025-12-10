import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { seedDefaultTags } from './tagController';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-me';

export const loginAsGuest = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.create({
            data: {
                name: 'Guest',
                isGuest: true
            }
        });

        const token = jwt.sign({ userId: user.id /* no email */ }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, name: user.name, email: null, isGuest: true } });
    } catch (error) {
        console.error('Guest login error:', error);
        res.status(500).json({ error: 'Guest login failed' });
    }
};

export const signup = async (req: Request, res: Response) => {
    const { name, email, password, accountPurpose } = req.body;

    try {
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                isGuest: false,
                accountPurpose: accountPurpose || 'custom'
            }
        });

        // Seed default tags based on account purpose
        if (accountPurpose) {
            await seedDefaultTags(user.id, accountPurpose);
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, accountPurpose: user.accountPurpose } });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.sendStatus(401);

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.sendStatus(404);

        res.json({ id: user.id, name: user.name, email: user.email });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { name, email } = req.body;

        if (!email) return res.status(400).json({ error: 'Email required' });

        // Check if email taken by another user
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== userId) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { name, email }
        });

        res.json({ id: user.id, name: user.name, email: user.email });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const updatePassword = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.password) return res.status(404).json({ error: 'User not found' });

        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) return res.status(400).json({ error: 'Incorrect current password' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashed }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update password' });
    }
};

export const deleteAccount = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        await prisma.user.delete({ where: { id: userId } });
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete account' });
    }
};
