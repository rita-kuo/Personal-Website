import React from 'react';
import { getMessages } from '../../lib/getMessages';

type Props = {
    params: { locale: string } | Promise<{ locale: string }>;
    children: React.ReactNode;
};

export default async function LocaleLayout({ params, children }: Props) {
    const resolved = await params;
    const locale = resolved.locale;
    const { messages } = await getMessages(locale, 'common');

    // NOTE: Integrate next-intl provider here. Example:
    // import { NextIntlProvider } from 'next-intl'
    // return (<html lang={locale}><body><NextIntlProvider messages={messages}>{children}</NextIntlProvider></body></html>)

    return (
        <html lang={locale}>
            <body>
                {/* Simple fallback: render children. next-intl provider should wrap here. */}
                {children}
            </body>
        </html>
    );
}
