import React from 'react';
import { getMessages } from '../../lib/getMessages';

// params may be a Promise in some Next.js runtime shapes; await to be safe
type Props = { params: { locale: string } | Promise<{ locale: string }> };

export default async function LocalePage({ params }: Props) {
    const resolved = await params;
    const locale = resolved.locale;
    const { messages } = await getMessages(locale, 'common');

    return (
        <main>
            <h1>{messages.title ?? '—'}</h1>
            <p>{messages.description ?? ''}</p>
        </main>
    );
}
