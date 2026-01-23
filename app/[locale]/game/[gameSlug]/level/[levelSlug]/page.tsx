import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getMessages } from '@/lib/getMessages';
import LevelDetailList from './_components/LevelDetailList';

interface PageProps {
    params: Promise<{
        locale: string;
        gameSlug: string;
        levelSlug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { gameSlug, levelSlug, locale } = await params;

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
        redirect(`/${locale}/game/${gameSlug}/level-not-found`);
    }

    return (
        <main className='container'>
            <LevelDetailList details={level.details} />
        </main>
    );
}
