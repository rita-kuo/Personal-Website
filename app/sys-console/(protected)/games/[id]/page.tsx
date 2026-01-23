import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { getMessages } from '@/lib/getMessages';
import { cookies } from 'next/headers';
import GameEditor from '../../game/_components/GameEditor';
import { getGame } from '../../game/actions';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh-TW';
    const { messages } = await getMessages(locale, 'sys');
    const t = (messages as any).gameEditor;
    const { id } = await params;
    const gameId = parseInt(id, 10);

    if (isNaN(gameId)) {
        return {
            title: t.editTitle,
        };
    }

    const game = await getGame(gameId);
    const title = game
        ? t.editTitleWithName.replace('{name}', game.name)
        : t.editTitle;

    return {
        title,
    };
}

export default async function GameEditPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    if (!session) {
        redirect('/sys-console/login');
    }

    const { id } = await params;
    const gameId = parseInt(id, 10);

    if (isNaN(gameId)) {
        notFound();
    }

    const game = await getGame(gameId);

    if (!game) {
        notFound();
    }

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh-TW';
    const { messages } = await getMessages(locale, 'sys');
    const t = (messages as any).gameEditor;

    return <GameEditor initialGame={game} t={t} locale={locale} />;
}
