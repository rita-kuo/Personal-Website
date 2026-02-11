import { Metadata } from 'next';
import { TripAccess } from '@prisma/client';
import { auth } from '@/lib/auth';
import { getMessages } from '@/lib/getMessages';
import { getItineraryTrips } from '@/lib/itinerary';
import ItineraryTripList from './_components/ItineraryTripList';

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
    const session = await auth();
    const { messages } = await getMessages(locale, 'itinerary');
    const accessFilter = session ? undefined : TripAccess.PUBLIC;
    const trips = await getItineraryTrips({ access: accessFilter });

    return (
        <ItineraryTripList
            messages={messages as any}
            trips={trips}
            locale={locale}
        />
    );
}
