import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getMessages } from '@/lib/getMessages';
import { cookies } from 'next/headers';
import GameEditor from '../_components/GameEditor';

export async function generateMetadata() {
    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh-TW';
    const { messages } = await getMessages(locale, 'sys');
    const t = (messages as any).gameEditor;

    return {
        title: t.newTitle,
    };
}

export default async function NewGamePage() {
    const session = await auth();
    if (!session) {
        redirect('/sys-console/login');
    }

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh-TW';
    const { messages } = await getMessages(locale, 'sys');
    const t = (messages as any).gameEditor;

    return (
        <>
            <h1 style={{ marginBottom: '1rem' }}>{t.newTitle}</h1>
            <GameEditor t={t} />
        </>
    );
}
