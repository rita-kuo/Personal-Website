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
    let method = 'POST';
    let headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    let body = JSON.stringify({ timestamp: new Date().toISOString() });

    // Basic support for curl command content
    if (detail.content.trim().startsWith('curl')) {
        const urlMatch = detail.content.match(/--location '([^']+)'/);
        if (urlMatch) {
            url = urlMatch[1];
        }

        const methodMatch =
            detail.content.match(/--request\s+([A-Z]+)/) ||
            detail.content.match(/-X\s+([A-Z]+)/);
        if (methodMatch) {
            method = methodMatch[1];
        }

        const headerRegex = /(?:--header|-H)\s+'([^']+)'/g;
        let headerMatch;
        while ((headerMatch = headerRegex.exec(detail.content)) !== null) {
            const headerContent = headerMatch[1];
            const separatorIndex = headerContent.indexOf(':');
            if (separatorIndex !== -1) {
                const key = headerContent.substring(0, separatorIndex).trim();
                const value = headerContent
                    .substring(separatorIndex + 1)
                    .trim();
                headers[key] = value;
            }
        }

        const dataMatch = detail.content.match(/--data '(\{[\s\S]*?\})'/);
        if (dataMatch) {
            // Use the data from curl command
            body = dataMatch[1];
        }
    }

    if (IOT_INVOKE_SECRET) {
        headers['Authorization'] = `Bearer ${IOT_INVOKE_SECRET}`;
    }

    try {
        // Assuming the content is the URL to call
        const response = await fetch(url, {
            method,
            headers,
            body,
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
