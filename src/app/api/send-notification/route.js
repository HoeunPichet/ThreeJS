import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { title, message, targetIds, segments } = await request.json();

        const payload = {
            app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
            contents: { en: message },
            headings: { en: title },
        };

        // Target specific users if IDs are provided
        if (targetIds && targetIds.length > 0) {
            payload.include_player_ids = targetIds;
        }

        // Target segments if provided, otherwise send to all subscribers
        if (segments && segments.length > 0) {
            payload.included_segments = segments;
        } else if (!targetIds || targetIds.length === 0) {
            payload.included_segments = ['All'];
        }

        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${process.env.NEXT_PUBLIC_ONESIGNAL_REST_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.errors?.[0] || 'Failed to send notification');
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send notification' },
            { status: 500 }
        );
    }
}
