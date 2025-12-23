import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import Link from 'next/link';
import { getMessages } from '@/lib/getMessages';
import { cookies } from 'next/headers';
import GameRow from '../_components/GameRow';
import './dashboard.css';

export default async function AdminDashboard() {
    const session = await auth();

    if (!session) {
        redirect('/sys-console/login');
    }

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh-TW';
    const { messages } = await getMessages(locale, 'sys');
    const t = (messages as any).dashboard;

    const games = await prisma.game.findMany({
        take: 5,
        orderBy: {
            updatedAt: 'desc',
        },
    });

    return (
        <>
            <hgroup className='dashboard-header'>
                <h1>{t.title}</h1>
                <p>{t.welcome.replace('{name}', session.user?.name || '')}</p>
            </hgroup>

            <article className='dashboard-card'>
                <header className='card-header'>
                    <h3 className='card-title'>{t.recentGames}</h3>
                    <Link
                        href='/sys-console/games'
                        className='secondary outline view-all-btn'
                    >
                        {t.viewAll}
                    </Link>
                </header>

                <div className='table-container'>
                    <table className='games-table'>
                        <tbody>
                            {games.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className='empty-state'>
                                        {t.noGames}
                                    </td>
                                </tr>
                            ) : (
                                games.map((game) => (
                                    <GameRow
                                        key={game.id}
                                        id={game.id}
                                        name={game.name}
                                        updatedAt={new Date(
                                            game.updatedAt
                                        ).toLocaleDateString()}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </article>
        </>
    );
}
