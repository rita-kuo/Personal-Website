import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TripAccess } from '@prisma/client';
import { auth } from '@/lib/auth';
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
    const session = await auth();
    const { messages } = await getMessages(resolved.locale, 'itinerary');
    const accessFilter = session ? undefined : TripAccess.PUBLIC;
    const trip = await getItineraryTripBySlug(resolved.slug, {
        access: accessFilter,
    });

    if (!trip) {
        notFound();
    }

    return <ItineraryTimeline messages={messages as any} trip={trip} />;
}
