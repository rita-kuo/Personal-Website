import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
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
        return {
            title: 'Not Found',
        };
    }

    return {
        title: level.game.name,
    };
}

export default async function LevelPage({ params }: PageProps) {
    const { gameSlug, levelSlug } = await params;

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
        notFound();
    }

    console.log('Level details:', level.details);

    return (
        <main className='container'>
            <LevelDetailList details={level.details} />
        </main>
    );
}
