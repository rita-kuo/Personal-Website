import prisma from '@/lib/db';
import { getMessages } from '@/lib/getMessages';
import LevelDetailList from './_components/LevelDetailList';
import CenteredCardLayout from '../../_components/CenteredCardLayout';
import {
    getClientIp,
    getIpWhitelist,
    isIpAllowed,
} from '@/app/[locale]/game/[gameSlug]/level/[levelSlug]/ipWhitelist';

interface PageProps {
    params: Promise<{
        locale: string;
        gameSlug: string;
        levelSlug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { gameSlug, levelSlug, locale } = await params;

    const clientIp = await getClientIp();
    const whitelist = await getIpWhitelist();
    if (!isIpAllowed(whitelist, clientIp)) {
        const { messages } = await getMessages(locale, 'gamePlay');
        return {
            title: messages.accessDeniedTitle ?? '',
        };
    }

    const level = await prisma.level.findFirst({
        where: {
            slug: levelSlug,
            game: {
                slug: gameSlug,
            },
        },
        include: {
            game: true,
        },
    });

    if (!level) {
        const { messages } = await getMessages(locale, 'gamePlay');
        return {
            title: messages.levelNotFoundTitle ?? '',
        };
    }

    return {
        title: level.game.name,
    };
}

export default async function LevelPage({ params }: PageProps) {
    const { gameSlug, levelSlug, locale } = await params;

    const clientIp = await getClientIp();
    const whitelist = await getIpWhitelist();
    if (!isIpAllowed(whitelist, clientIp)) {
        const { messages } = await getMessages(locale, 'gamePlay');
        return (
            <main className='container'>
                <CenteredCardLayout
                    title={messages.accessDeniedTitle}
                    description={messages.accessDeniedBody}
                />
            </main>
        );
    }

    const level = await prisma.level.findFirst({
        where: {
            slug: levelSlug,
            game: {
                slug: gameSlug,
            },
        },
        include: {
            details: {
                orderBy: {
                    id: 'asc',
                },
            },
        },
    });

    if (!level) {
        const { messages } = await getMessages(locale, 'gamePlay');
        return (
            <main className='container'>
                <CenteredCardLayout
                    title={messages.levelNotFoundTitle}
                    description={messages.levelNotFoundBody}
                />
            </main>
        );
    }

    return (
        <main className='container'>
            <LevelDetailList details={level.details} />
        </main>
    );
}
