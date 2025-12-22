import { signIn } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    const { error } = await searchParams;
    const session = await auth();
    if (session) {
        redirect('/sys-console');
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontFamily: 'sans-serif',
            }}
        >
            <div
                style={{
                    padding: '2rem',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    textAlign: 'center',
                    maxWidth: '400px',
                }}
            >
                <h1 style={{ marginBottom: '1.5rem' }}>System Console</h1>

                {error === 'AccessDenied' && (
                    <div
                        style={{
                            color: 'red',
                            marginBottom: '1rem',
                            padding: '0.5rem',
                            background: '#ffebee',
                            borderRadius: '4px',
                        }}
                    >
                        Access Denied. Your email is not authorized.
                    </div>
                )}

                <form
                    action={async () => {
                        'use server';
                        await signIn('line', { redirectTo: '/sys-console' });
                    }}
                >
                    <button
                        type='submit'
                        style={{
                            background: '#06C755',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                        }}
                    >
                        Sign in with LINE
                    </button>
                </form>
            </div>
        </div>
    );
}
