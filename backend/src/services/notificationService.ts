import webpush from 'web-push';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configure web-push
const publicVapidKey = process.env.VAPID_PUBLIC_KEY!;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY!;
const subject = process.env.VAPID_SUBJECT || 'mailto:test@example.com';

if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(subject, publicVapidKey, privateVapidKey);
} else {
    console.warn('VAPID keys not found. Push notifications disabled.');
}

/**
 * Save a push subscription for a user
 */
export const subscribe = async (userId: string, subscription: any) => {
    try {
        await prisma.pushSubscription.upsert({
            where: {
                userId_endpoint: {
                    userId,
                    endpoint: subscription.endpoint,
                },
            },
            update: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
            create: {
                userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
            },
        });
        return true;
    } catch (error) {
        console.error('Subscribe Error:', error);
        return false;
    }
};

/**
 * Send a notification to a specific user
 */
export const sendNotification = async (userId: string, payload: { title: string; body: string; url?: string }) => {
    try {
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });

        const notifications = subscriptions.map((sub) => {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    auth: sub.auth,
                    p256dh: sub.p256dh,
                },
            };
            return webpush.sendNotification(pushConfig, JSON.stringify(payload))
                .catch(err => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription invalid, delete it
                        console.log('Subscription expired, deleting:', sub.id);
                        return prisma.pushSubscription.delete({ where: { id: sub.id } });
                    }
                    console.error('Push Error:', err);
                });
        });

        await Promise.all(notifications);
    } catch (error) {
        console.error('Send Notification Error:', error);
    }
};

/**
 * Check for upcoming tasks and send reminders
 * Runs every minute
 */
export const checkReminders = () => {
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        // Window: 59-61 minutes from now
        const startWindow = new Date(oneHourFromNow.getTime() - 60 * 1000);
        const endWindow = new Date(oneHourFromNow.getTime() + 60 * 1000);

        try {
            const upcomingTasks = await prisma.task.findMany({
                where: {
                    dueAt: {
                        gte: startWindow,
                        lte: endWindow,
                    },
                    status: 'pending',
                },
                include: { user: true }
            });

            for (const task of upcomingTasks) {
                console.log(`Sending reminder for task: ${task.title}`);
                await sendNotification(task.userId, {
                    title: 'Reminder: Upcoming Task',
                    body: `${task.title} is due in 1 hour.`,
                    url: `/tasks` // Deep link if needed
                });
            }
        } catch (error) {
            console.error('Check Reminders Error:', error);
        }
    });
};

export const initScheduler = () => {
    console.log('Initializing notification scheduler...');
    checkReminders();
};
