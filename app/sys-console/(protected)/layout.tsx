import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Header from '../_components/Header';
import { getMessages } from '@/lib/getMessages';
import { logout } from '../actions';
import { cookies } from 'next/headers';

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) {
        redirect('/sys-console/login');
    }

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh-TW';

    const { messages } = await getMessages(locale, 'sys');

    const t = {
        title: (messages as any).title || 'Management Platform',
        game: (messages as any).menu?.game || 'Game Management',
        itinerary: (messages as any).menu?.itinerary || 'Itinerary Management',
        logout: (messages as any).user?.logout || 'Logout',
    };

    return (
        <>
            <Header user={session.user || {}} t={t} onLogout={logout} />
            <main className='container' style={{ paddingTop: '2rem' }}>
                {children}
            </main>
        </>
    );
}
