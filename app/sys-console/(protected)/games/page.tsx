import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import Link from 'next/link';
import { getMessages } from '@/lib/getMessages';
import { cookies } from 'next/headers';
import GameListItem from '../../_components/GameListItem';
import Pagination from '../../_components/Pagination';
import styles from './games.module.css';

export async function generateMetadata() {
    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh-TW';
    const { messages } = await getMessages(locale, 'sys');
    const t = (messages as any).games;

    return {
        title: t.title,
    };
}

export default async function GamesPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await auth();
    if (!session) {
        redirect('/sys-console/login');
    }

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh-TW';
    const { messages } = await getMessages(locale, 'sys');
    const t = (messages as any).games;

    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const [games, totalCount] = await Promise.all([
        prisma.game.findMany({
            skip,
            take: pageSize,
            orderBy: {
                updatedAt: 'desc',
            },
        }),
        prisma.game.count(),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{t.title}</h1>
                <Link href='/sys-console/game/new' className={styles.addButton}>
                    <i
                        className='ri-add-line'
                        style={{ fontSize: '1.25rem' }}
                    ></i>
                    {t.addGame}
                </Link>
            </header>

            <div className={styles.list}>
                {games.map((game) => (
                    <GameListItem
                        key={game.id}
                        id={game.id}
                        name={game.name}
                        updatedAt={new Date(game.updatedAt).toLocaleString(
                            locale
                        )}
                        updatedAtLabel={t.list.updatedAt}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    baseUrl='/sys-console/games'
                    prevLabel={t.pagination.prev}
                    nextLabel={t.pagination.next}
                />
            )}
        </main>
    );
}
