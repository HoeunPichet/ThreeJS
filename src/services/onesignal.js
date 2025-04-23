"use client"
import OneSignal from 'react-onesignal';

export const initOneSignal = async () => {
    try {
        await OneSignal.init({
            appId: `${process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID}`,
            // safari_web_id: "YOUR_SAFARI_WEB_ID", // Only needed if you want Safari push on macOS
            allowLocalhostAsSecureOrigin: true, // Helpful for local development
            serviceWorkerPath: "/onesignal/", // Next.js 15.3.1 best practice for service worker
            serviceWorkerParam: { scope: "/onesignal/" },
            notifyButton: {
                enable: true,
            },
            promptOptions: {
                slidedown: {
                    prompts: [
                        {
                            type: "push",
                            autoPrompt: true,
                            text: {
                                actionMessage: "Would you like to receive notifications?",
                                acceptButton: "Allow",
                                cancelButton: "Cancel",
                            },
                        },
                    ],
                },
            },
        });

        console.log('OneSignal initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing OneSignal:', error);
        return false;
    }
};

// Access user ID through the User object
export const getOneSignalUserId = () => {
    try {
        // Check if OneSignal exists and is initialized
        if (OneSignal && OneSignal.User) {
            return OneSignal.User.onesignalId;
        }
        return null;
    } catch (error) {
        console.error('Error getting OneSignal user ID:', error);
        return null;
    }
};

// Access subscription ID through the PushSubscription object
export const getOneSignalSubscriptionId = () => {
    try {
        if (OneSignal && OneSignal.User && OneSignal.User.PushSubscription) {
            return OneSignal.User.PushSubscription.id;
        }
        return null;
    } catch (error) {
        console.error('Error getting OneSignal subscription ID:', error);
        return null;
    }
};

// Get push subscription token
export const getOneSignalPushToken = () => {
    try {
        if (OneSignal && OneSignal.User && OneSignal.User.PushSubscription) {
            return OneSignal.User.PushSubscription.token;
        }
        return null;
    } catch (error) {
        console.error('Error getting OneSignal push token:', error);
        return null;
    }
};

// Function to prompt user for notification permission
export const promptForNotificationPermission = async () => {
    try {
        // Show the notification prompt using the Slidedown API
        await OneSignal.Slidedown.promptPush();
        return true;
    } catch (error) {
        console.error('Error showing notification prompt:', error);
        return false;
    }
};

// Function to check if user is opted in to push notifications
export const isPushNotificationsEnabled = () => {
    try {
        if (OneSignal && OneSignal.User && OneSignal.User.PushSubscription) {
            return OneSignal.User.PushSubscription.optedIn;
        }
        return false;
    } catch (error) {
        console.error('Error checking push notification status:', error);
        return false;
    }
};

// Function to opt in to push notifications
export const optInToPushNotifications = async () => {
    try {
        if (OneSignal && OneSignal.User && OneSignal.User.PushSubscription) {
            await OneSignal.User.PushSubscription.optIn();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error opting in to push notifications:', error);
        return false;
    }
};
