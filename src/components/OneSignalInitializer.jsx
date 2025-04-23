'use client';

import { initOneSignal } from '@/services/onesignal';
import { useEffect, useState } from 'react';

export default function OneSignalInitializer() {
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        // Only initialize OneSignal on client side
        if (typeof window !== 'undefined' && !initialized) {
            const init = async () => {
                const result = await initOneSignal();
                setInitialized(result);
            };
            init();
        }
    }, [initialized]);

    // This component doesn't render anything visible
    return null;
}
