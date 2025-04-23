'use client';

import { useState, useEffect } from 'react';
import {
    getOneSignalUserId,
    getOneSignalSubscriptionId,
    isPushNotificationsEnabled,
    promptForNotificationPermission,
    optInToPushNotifications
} from '@/services/onesignal';

export default function NotificationButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [userId, setUserId] = useState(null);
    const [subscriptionId, setSubscriptionId] = useState(null);

    // Check notification status when component mounts
    useEffect(() => {
        const checkStatus = () => {
            const enabled = isPushNotificationsEnabled();
            setNotificationsEnabled(enabled);

            const uid = getOneSignalUserId();
            setUserId(uid);

            const sid = getOneSignalSubscriptionId();
            setSubscriptionId(sid);
        };

        // Check after a short delay to ensure OneSignal is fully initialized
        const timer = setTimeout(checkStatus, 2000);

        return () => clearTimeout(timer);
    }, []);

    const requestPermission = async () => {
        setIsLoading(true);
        setStatus(null);

        try {
            await promptForNotificationPermission();
            await optInToPushNotifications();

            // Re-check status after permission request
            const enabled = isPushNotificationsEnabled();
            setNotificationsEnabled(enabled);

            const uid = getOneSignalUserId();
            setUserId(uid);

            const sid = getOneSignalSubscriptionId();
            setSubscriptionId(sid);

            setStatus({
                success: enabled,
                message: enabled ? 'Notifications enabled!' : 'Please allow notifications in your browser settings'
            });
        } catch (error) {
            console.error('Error requesting permission:', error);
            setStatus({ success: false, message: 'Failed to enable notifications' });
        } finally {
            setIsLoading(false);
        }
    };

    const sendNotification = async () => {
        setIsLoading(true);
        setStatus(null);

        try {
            // Check if notifications are enabled
            if (!notificationsEnabled) {
                await requestPermission();
                if (!isPushNotificationsEnabled()) {
                    throw new Error('Please enable notifications first');
                }
            }

            // Get up-to-date IDs
            const sid = getOneSignalSubscriptionId();
            const uid = getOneSignalUserId();

            if (!sid && !uid) {
                throw new Error('Could not identify subscription, please try again');
            }

            // Prefer subscription ID if available, otherwise use user ID
            const targetIds = sid ? [sid] : uid ? [uid] : [];

            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: 'New Notification',
                    message: 'This is a test notification from your Next.js 15.3.1 app!',
                    targetIds: targetIds,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send notification');
            }

            setStatus({ success: true, message: 'Notification sent successfully!' });
            console.log('Notification sent:', data);
        } catch (error) {
            console.error('Error:', error);
            setStatus({ success: false, message: error.message || 'Failed to send notification' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium">Notification Status</p>
                <p className={notificationsEnabled ? "text-green-500" : "text-yellow-500"}>
                    {notificationsEnabled ? 'Enabled' : 'Not enabled'}
                </p>
                {userId && (
                    <p className="text-xs text-gray-500">User ID: {userId}</p>
                )}
                {subscriptionId && (
                    <p className="text-xs text-gray-500">Subscription ID: {subscriptionId}</p>
                )}
            </div>

            <div className="flex gap-2">
                {!notificationsEnabled && (
                    <button
                        onClick={requestPermission}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isLoading ? 'Processing...' : 'Enable Notifications'}
                    </button>
                )}

                <button
                    onClick={sendNotification}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                    {isLoading ? 'Sending...' : 'Send Test Notification'}
                </button>
            </div>

            {status && (
                <p className={status.success ? "text-green-500 mt-2" : "text-red-500 mt-2"}>
                    {status.message}
                </p>
            )}
        </div>
    );
}
