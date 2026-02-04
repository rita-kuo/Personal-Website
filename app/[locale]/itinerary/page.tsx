import { Metadata } from 'next';
import { getMessages } from '@/lib/getMessages';
import ItineraryTimeline from './_components/ItineraryTimeline';

type Props = { params: { locale: string } | Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolved = await params;
    const locale = resolved.locale;
    const { messages } = await getMessages(locale, 'itinerary');

    return {
        title: (messages as any).title ?? '—',
    };
}

export default async function ItineraryPage({ params }: Props) {
    const resolved = await params;
    const locale = resolved.locale;
    const { messages } = await getMessages(locale, 'itinerary');

    return <ItineraryTimeline messages={messages as any} />;
}
