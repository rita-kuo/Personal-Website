import React from 'react';
import { getMessages } from '../../lib/getMessages';
import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import '../globals.css';

export const metadata: Metadata = {
    title: {
        template: "%s - Rita's",
        default: "Rita's Personal Website",
    },
};

type Props = {
    params: { locale: string } | Promise<{ locale: string }>;
    children: React.ReactNode;
};

export default async function LocaleLayout({ params, children }: Props) {
    const resolved = await params;
    const locale = resolved.locale;
    // Fetch all messages by passing a non-existent namespace, triggering the fallback to all data
    const { messages } = await getMessages(locale, '_ALL_');

    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
