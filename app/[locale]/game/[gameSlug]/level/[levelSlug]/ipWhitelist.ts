import 'server-only';
import { headers } from 'next/headers';
import prisma from '@/lib/db';

const GAME_IP_WHITELIST_KEY = 'GameIpWhitelist';

export async function getIpWhitelist(): Promise<string[] | null> {
    const rows = await prisma.$queryRaw<{ value: string }[]>`
        SELECT value
        FROM "Config"
        WHERE key = ${GAME_IP_WHITELIST_KEY}
        LIMIT 1
    `;
    const configValue = rows[0]?.value;

    if (!configValue) {
        return null;
    }

    try {
        const parsed = JSON.parse(configValue);
        if (!Array.isArray(parsed)) {
            return null;
        }

        return parsed
            .map((entry) => String(entry).trim())
            .filter((entry) => entry.length > 0);
    } catch {
        return null;
    }
}

export async function getClientIp(): Promise<string | null> {
    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for');
    if (forwardedFor) {
        const first = forwardedFor.split(',')[0]?.trim();
        if (first) {
            return first;
        }
    }

    const realIp = headerList.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }

    const cfConnectingIp = headerList.get('cf-connecting-ip');
    if (cfConnectingIp) {
        return cfConnectingIp.trim();
    }

    return null;
}

export function isIpAllowed(
    whitelist: string[] | null,
    clientIp: string | null
): boolean {
    if (!clientIp) {
        return false;
    }

    return whitelist?.includes(clientIp) ?? false;
}
