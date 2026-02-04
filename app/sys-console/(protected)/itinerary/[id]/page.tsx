import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getMessages } from '@/lib/getMessages';
import { getItineraryTripById } from '@/lib/itinerary';
import ItineraryAdmin from '../_components/ItineraryAdmin';

type Props = {
    params: { id: string } | Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolved = await params;
    const tripId = Number(resolved.id);
    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh-TW';
    const { messages } = await getMessages(locale, 'sys');
    const t = (messages as any).itinerary;

    if (!Number.isFinite(tripId)) {
        return { title: t?.title ?? '—' };
    }

    const trip = await getItineraryTripById(tripId);

    return {
        title: trip?.title ?? t?.title ?? '—',
    };
}

export default async function ItineraryTripPage({ params }: Props) {
    const session = await auth();
    if (!session) {
        redirect('/sys-console/login');
    }

    const resolved = await params;
    const tripId = Number(resolved.id);
    if (!Number.isFinite(tripId)) {
        redirect('/sys-console/itinerary');
    }

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh-TW';
    const { messages } = await getMessages(locale, 'sys');
    const trip = await getItineraryTripById(tripId);

    return <ItineraryAdmin messages={messages as any} days={trip?.days ?? []} />;
}
