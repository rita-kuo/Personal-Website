import { signIn } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getMessages } from '@/lib/getMessages';

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
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                backgroundColor: '#f5f5f5',
            }}
        >
            <div
                style={{
                    padding: '2.5rem',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    width: '100%',
                    maxWidth: '360px',
                }}
            >
                <h1
                    style={{
                        marginBottom: '2rem',
                        fontSize: '1.5rem',
                        color: '#333',
                        fontWeight: 600,
                    }}
                >
                    {t('loginTitle')}
                </h1>

                {error && (
                    <div
                        style={{
                            color: '#d32f2f',
                            marginBottom: '1.5rem',
                            padding: '0.75rem',
                            background: '#ffebee',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            border: '1px solid #ffcdd2',
                        }}
                    >
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
                >
                    <button
                        type='submit'
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            backgroundColor: '#06C755',
                            color: 'white',
                            padding: '0',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            height: '50px',
                            transition: 'background-color 0.2s',
                        }}
                    >
                        <div
                            style={{
                                width: '50px',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRight: '1px solid rgba(0,0,0,0.08)',
                            }}
                        >
                            <svg
                                style={{ height: '100%', width: 'auto' }}
                                viewBox="1066 586 428 428"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="m 0,0 h -175.719 c -39.843,0 -72.14,32.299 -72.14,72.141 v 175.718 c 0,39.842 32.297,72.141 72.14,72.141 H 0 c 39.843,0 72.141,-32.299 72.141,-72.141 V 72.141 C 72.141,32.299 39.843,0 0,0"
                                    fill="#06c755"
                                    transform="matrix(1.3333333,0,0,-1.3333333,1397.1459,1013.3363)"
                                />
                                <path
                                    d="m 0,0 c 0,47.74 -47.859,86.58 -106.688,86.58 -58.825,0 -106.689,-38.84 -106.689,-86.58 0,-42.798 37.955,-78.642 89.226,-85.417 3.473,-0.751 8.203,-2.292 9.398,-5.262 1.076,-2.696 0.704,-6.922 0.346,-9.646 0,0 -1.252,-7.529 -1.524,-9.134 -0.465,-2.695 -2.144,-10.549 9.243,-5.752 11.386,4.799 61.44,36.18 83.824,61.941 h -0.005 C -7.408,-36.313 0,-19.105 0,0"
                                    fill="#ffffff"
                                    transform="matrix(1.3333333,0,0,-1.3333333,1422.2084,779.90268)"
                                />
                                <path
                                    d="m 0,0 h -29.934 -0.04 c -1.125,0 -2.037,0.911 -2.037,2.037 v 0.032 0.003 46.479 0.003 0.044 c 0,1.125 0.912,2.037 2.037,2.037 h 0.04 H 0 c 1.12,0 2.037,-0.916 2.037,-2.037 V 41.032 C 2.037,39.907 1.125,38.995 0,38.995 H -20.37 V 31.138 H 0 c 1.12,0 2.037,-0.917 2.037,-2.037 V 21.534 C 2.037,20.409 1.125,19.497 0,19.497 H -20.37 V 11.64 H 0 c 1.12,0 2.037,-0.916 2.037,-2.036 V 2.037 C 2.037,0.911 1.125,0 0,0"
                                    fill="#06c755"
                                    transform="matrix(1.3333333,0,0,-1.3333333,1374.8841,816.65655)"
                                />
                                <path
                                    d="M 0,0 C 1.125,0 2.037,0.911 2.037,2.037 V 9.604 C 2.037,10.724 1.12,11.64 0,11.64 h -20.371 v 36.958 c 0,1.121 -0.916,2.037 -2.036,2.037 h -7.567 c -1.125,0 -2.037,-0.912 -2.037,-2.037 V 2.072 2.069 2.037 C -32.011,0.911 -31.099,0 -29.974,0 h 0.04 z"
                                    fill="#06c755"
                                    transform="matrix(1.3333333,0,0,-1.3333333,1227.0521,816.65655)"
                                />
                                <path
                                    d="M 0,0 H -7.565 C -8.69,0 -9.603,-0.913 -9.603,-2.037 v -46.562 c 0,-1.125 0.913,-2.037 2.038,-2.037 H 0 c 1.126,0 2.037,0.912 2.037,2.037 V -2.037 C 2.037,-0.913 1.126,0 0,0"
                                    fill="#06c755"
                                    transform="matrix(1.3333333,0,0,-1.3333333,1251.1107,749.14228)"
                                />
                                <path
                                    d="m 0,0 h -7.566 c -1.125,0 -2.037,-0.913 -2.037,-2.037 v -27.655 l -21.303,28.769 c -0.05,0.074 -0.106,0.144 -0.164,0.21 -0.004,0.005 -0.008,0.01 -0.013,0.015 -0.039,0.044 -0.08,0.087 -0.123,0.127 l -0.038,0.035 c -0.036,0.032 -0.072,0.063 -0.11,0.094 l -0.056,0.041 c -0.034,0.025 -0.07,0.049 -0.108,0.074 -0.02,0.013 -0.041,0.025 -0.062,0.037 -0.037,0.022 -0.074,0.043 -0.112,0.062 -0.022,0.011 -0.043,0.022 -0.065,0.032 -0.039,0.018 -0.079,0.035 -0.119,0.051 -0.022,0.008 -0.044,0.016 -0.066,0.024 -0.041,0.015 -0.082,0.028 -0.124,0.04 -0.024,0.007 -0.048,0.013 -0.073,0.019 -0.04,0.009 -0.08,0.018 -0.121,0.026 -0.028,0.005 -0.057,0.009 -0.086,0.014 -0.037,0.004 -0.073,0.009 -0.11,0.012 -0.036,0.004 -0.072,0.005 -0.108,0.006 C -32.588,-0.003 -32.611,0 -32.635,0 h -7.524 c -1.125,0 -2.037,-0.913 -2.037,-2.037 v -46.562 c 0,-1.125 0.912,-2.037 2.037,-2.037 h 7.566 c 1.125,0 2.037,0.912 2.037,2.037 v 27.646 l 21.33,-28.805 c 0.147,-0.208 0.327,-0.378 0.526,-0.513 0.008,-0.005 0.015,-0.011 0.023,-0.016 0.041,-0.028 0.085,-0.054 0.128,-0.078 0.02,-0.011 0.039,-0.023 0.06,-0.032 0.032,-0.018 0.064,-0.034 0.098,-0.048 0.034,-0.016 0.066,-0.03 0.1,-0.043 0.021,-0.009 0.043,-0.017 0.064,-0.024 0.046,-0.016 0.093,-0.032 0.141,-0.045 0.01,-0.003 0.02,-0.006 0.029,-0.007 0.17,-0.045 0.348,-0.072 0.533,-0.072 H 0 c 1.125,0 2.037,0.912 2.037,2.037 V -2.037 C 2.037,-0.913 1.125,0 0,0"
                                    fill="#06c755"
                                    transform="matrix(1.3333333,0,0,-1.3333333,1319.7891,749.14228)"
                                />
                            </svg>
                        </div>
                        <span style={{ flex: 1, textAlign: 'center' }}>
                            {t('loginButton')}
                        </span>
                    </button>
                </form>
            </div>
        </div>
    );
}
