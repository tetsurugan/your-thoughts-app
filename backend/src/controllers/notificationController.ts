import { Request, Response } from 'express';
import { subscribe, sendNotification } from '../services/notificationService';

export const subscribeUser = async (req: Request, res: Response) => {
    const { userId, subscription } = req.body;
    // In real app, get userId from session/token
    const finalUserId = userId || 'mock-user-id';

    if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: 'Invalid subscription' });
    }

    const success = await subscribe(finalUserId, subscription);
    if (success) {
        res.status(201).json({ message: 'Subscribed successfully' });
    } else {
        res.status(500).json({ error: 'Failed to subscribe' });
    }
};

export const testNotification = async (req: Request, res: Response) => {
    const { userId } = req.body;
    const finalUserId = userId || 'mock-user-id';

    await sendNotification(finalUserId, {
        title: 'Test Notification',
        body: 'This is a test notification from Your Thoughts!',
    });

    res.json({ message: 'Test notification sent' });
};
