import { signIn } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getMessages } from '@/lib/getMessages';
import { Metadata } from 'next';
import './line.css';

export const metadata: Metadata = {
    title: '登入管理畫面',
};

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

    // Load 'auth' namespace specifically
    const { messages } = await getMessages('zh-TW', 'auth');
    const t = (key: string) => {
        // Since we loaded 'auth' namespace, we access keys directly
        // e.g. t('loginTitle') instead of t('auth.loginTitle')
        return (messages as any)[key] || key;
    };

    return (
        <main
            className='container'
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: '100vh',
            }}
        >
            <article
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    margin: '0 auto',
                    textAlign: 'center',
                }}
            >
                <header style={{ borderBottom: 'none', paddingBottom: 0 }}>
                    <hgroup style={{ marginBottom: '1rem' }}>
                        <h2 style={{ marginBottom: 0 }}>{t('loginTitle')}</h2>
                        <p
                            style={{
                                fontSize: '0.8em',
                                color: 'var(--pico-muted-color)',
                            }}
                        >
                            Rita's System Console
                        </p>
                    </hgroup>
                </header>

                {error && (
                    <div role='alert' className='alert error'>
                        {error === 'AccessDenied'
                            ? t('accessDenied')
                            : t('unknownError')}
                    </div>
                )}

                <form
                    action={async () => {
                        'use server';
                        await signIn('line', { redirectTo: '/sys-console' });
                    }}
                    style={{ marginBottom: 0 }}
                >
                    <button type='submit' className='btn-line'>
                        <div className='icon-wrapper'>
                            <i
                                className='ri-line-fill'
                                style={{ fontSize: '2rem', color: '#06c755' }}
                            ></i>
                        </div>
                        <span style={{ flex: 1, textAlign: 'center' }}>
                            {t('loginButton')}
                        </span>
                    </button>
                </form>
            </article>
        </main>
    );
}
