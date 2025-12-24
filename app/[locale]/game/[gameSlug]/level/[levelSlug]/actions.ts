'use server';

import prisma from '@/lib/db';

export async function triggerIotAction(detailId: number) {
    const detail = await prisma.levelDetail.findUnique({
        where: { id: detailId },
    });

    if (!detail || detail.actionType !== 'IOT') {
        return { success: false, error: 'Invalid detail' };
    }

    const IOT_INVOKE_SECRET = process.env.IOT_INVOKE_SECRET;

    let url = detail.content;
    let body = JSON.stringify({ timestamp: new Date().toISOString() });

    // Basic support for curl command content
    if (detail.content.trim().startsWith('curl')) {
        const urlMatch = detail.content.match(/--location '([^']+)'/);
        if (urlMatch) {
            url = urlMatch[1];
        }

        const dataMatch = detail.content.match(/--data '(\{[\s\S]*?\})'/);
        if (dataMatch) {
            // Use the data from curl command
            body = dataMatch[1];
        }
    }

    try {
        // Assuming the content is the URL to call
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(IOT_INVOKE_SECRET
                    ? { 'X-Trigger-Secret': IOT_INVOKE_SECRET }
                    : {}),
            },
            body: body,
        });

        if (!response.ok) {
            console.error('IOT API call failed', await response.text());
            return { success: false, error: 'IOT API call failed' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error triggering IOT action:', error);
        return { success: false, error: 'Internal server error' };
    }
}
