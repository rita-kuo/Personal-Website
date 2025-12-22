import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
    const session = await auth();

    if (!session) {
        redirect('/sys-console/login');
    }

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>System Console</h1>
            <p>
                Welcome, {session.user?.name} ({session.user?.email})
            </p>

            <div style={{ marginTop: '2rem' }}>
                <h2>Status</h2>
                <p>Logged in via LINE</p>
                <p>Session expires: {session.expires}</p>
            </div>

            <form
                action={async () => {
                    'use server';
                    await signOut();
                }}
            >
                <button
                    type='submit'
                    style={{
                        marginTop: '2rem',
                        padding: '0.5rem 1rem',
                        background: '#333',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Sign Out
                </button>
            </form>
        </div>
    );
}
