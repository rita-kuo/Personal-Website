import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
    const session = await auth();

    if (!session) {
        redirect('/sys-console/login');
    }

    return (
        <article>
            <header>
                <h1>Dashboard</h1>
            </header>
            <p>
                Welcome back, <strong>{session.user?.name}</strong>!
            </p>
            <p>
                <small>Email: {session.user?.email}</small>
            </p>

            <footer>
                <p>
                    Session expires:{' '}
                    {new Date(session.expires).toLocaleString()}
                </p>
            </footer>
        </article>
    );
}
