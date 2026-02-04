import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getMessages } from '@/lib/getMessages';
import { getItineraryTrips } from '@/lib/itinerary';
import ItineraryTripList from './_components/ItineraryTripList';

type Props = {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh-TW';
    const { messages } = await getMessages(locale, 'sys');
    const t = (messages as any).itineraryList;

    return {
        title: t?.title ?? '—',
    };
}

export default async function ItineraryAdminPage({}: Props) {
    const session = await auth();
    if (!session) {
        redirect('/sys-console/login');
    }

    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh-TW';
    const { messages } = await getMessages(locale, 'sys');
    const trips = await getItineraryTrips();
    return (
        <ItineraryTripList
            trips={trips}
            messages={{ itineraryList: (messages as any).itineraryList }}
        />
    );
}
