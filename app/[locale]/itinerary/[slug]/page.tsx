import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMessages } from '@/lib/getMessages';
import { getItineraryTripBySlug } from '@/lib/itinerary';
import ItineraryTimeline from '../_components/ItineraryTimeline';

type Props = {
    params:
        | { locale: string; slug: string }
        | Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolved = await params;
    const { messages } = await getMessages(resolved.locale, 'itinerary');
    const trip = await getItineraryTripBySlug(resolved.slug);

    return {
        title: trip?.title ?? (messages as any).title ?? '—',
    };
}

export default async function ItineraryDetailPage({ params }: Props) {
    const resolved = await params;
    const { messages } = await getMessages(resolved.locale, 'itinerary');
    const trip = await getItineraryTripBySlug(resolved.slug);

    if (!trip) {
        notFound();
    }

    return <ItineraryTimeline messages={messages as any} trip={trip} />;
}
