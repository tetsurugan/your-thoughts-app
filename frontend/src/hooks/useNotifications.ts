import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const useNotifications = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(async (registration) => {
                const subscription = await registration.pushManager.getSubscription();
                setIsSubscribed(!!subscription);
            });
        }
    }, []);

    const subscribe = async () => {
        if (!('serviceWorker' in navigator)) return;
        setLoading(true);

        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm === 'granted') {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                });

                await fetch(`${API_BASE}/api/notifications/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subscription,
                        userId: 'mock-user-id'
                    })
                });

                setIsSubscribed(true);
            }
        } catch (error) {
            console.error('Failed to subscribe:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendTestNotification = async () => {
        try {
            await fetch(`${API_BASE}/api/notifications/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'mock-user-id' })
            });
        } catch (error) {
            console.error('Failed to send test notification:', error);
        }
    };

    return {
        isSubscribed,
        loading,
        permission,
        subscribe,
        sendTestNotification
    };
};
