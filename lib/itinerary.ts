import prisma from '@/lib/db';
import { TripAccess } from '@prisma/client';

type ItineraryItemDTO = {
    id: number;
    title: string;
    startTime: string;
    endTime: string | null;
    location: string | null;
    parking: string | null;
    contact: string | null;
    memo: string | null;
};

type ItineraryDayDTO = {
    id: number;
    date: string;
    items: ItineraryItemDTO[];
};

export type ItineraryTripDTO = {
    id: number;
    title: string;
    slug: string;
    access: string;
    days: ItineraryDayDTO[];
};

type ItineraryTripListItemDTO = {
    id: number;
    title: string;
    slug: string;
    startDate: string | null;
    endDate: string | null;
};

const toIso = (value: Date | null) => (value ? value.toISOString() : null);

// TODO: 如果實作公開頁面登入，需另外處理 PRIVATE 權限檢查邏輯
type AccessFilter = {
    access?: TripAccess;
};

export async function getLatestItineraryTrip(
    filter?: AccessFilter,
): Promise<ItineraryTripDTO | null> {
    const trip = await prisma.itineraryTrip.findFirst({
        orderBy: { createdAt: 'desc' },
        where: filter?.access ? { access: filter.access } : undefined,
        include: {
            days: {
                orderBy: [{ date: 'asc' }],
                include: {
                    items: {
                        orderBy: [{ startTime: 'asc' }],
                    },
                },
            },
        },
    });

    if (!trip) return null;

    return {
        id: trip.id,
        title: trip.title,
        slug: trip.slug,
        access: trip.access,
        days: trip.days.map((day: (typeof trip.days)[number]) => ({
            id: day.id,
            date: day.date.toISOString(),
            items: day.items.map((item: (typeof day.items)[number]) => ({
                id: item.id,
                title: item.title,
                startTime: item.startTime.toISOString(),
                endTime: toIso(item.endTime),
                location: item.location,
                parking: item.parking,
                contact: item.contact,
                memo: item.memo,
            })),
        })),
    };
}

export async function getItineraryTrips(
    filter?: AccessFilter,
): Promise<ItineraryTripListItemDTO[]> {
    const trips = await prisma.itineraryTrip.findMany({
        orderBy: { createdAt: 'desc' },
        where: filter?.access ? { access: filter.access } : undefined,
        include: {
            days: {
                orderBy: [{ date: 'asc' }],
                select: { date: true },
            },
        },
    });

    return trips.map((trip) => {
        const firstDay = trip.days[0]?.date ?? null;
        const lastDay = trip.days[trip.days.length - 1]?.date ?? null;
        return {
            id: trip.id,
            title: trip.title,
            slug: trip.slug,
            startDate: toIso(firstDay),
            endDate: toIso(lastDay),
        };
    });
}

export async function getItineraryTripBySlug(
    slug: string,
    filter?: AccessFilter,
): Promise<ItineraryTripDTO | null> {
    const trip = await prisma.itineraryTrip.findFirst({
        where: {
            slug,
            ...(filter?.access ? { access: filter.access } : {}),
        },
        include: {
            days: {
                orderBy: [{ date: 'asc' }],
                include: {
                    items: {
                        orderBy: [{ startTime: 'asc' }],
                    },
                },
            },
        },
    });

    if (!trip) return null;

    return {
        id: trip.id,
        title: trip.title,
        slug: trip.slug,
        access: trip.access,
        days: trip.days.map((day: (typeof trip.days)[number]) => ({
            id: day.id,
            date: day.date.toISOString(),
            items: day.items.map((item: (typeof day.items)[number]) => ({
                id: item.id,
                title: item.title,
                startTime: item.startTime.toISOString(),
                endTime: toIso(item.endTime),
                location: item.location,
                parking: item.parking,
                contact: item.contact,
                memo: item.memo,
            })),
        })),
    };
}

export async function getItineraryTripById(
    id: number,
): Promise<ItineraryTripDTO | null> {
    const trip = await prisma.itineraryTrip.findUnique({
        where: { id },
        include: {
            days: {
                orderBy: [{ date: 'asc' }],
                include: {
                    items: {
                        orderBy: [{ startTime: 'asc' }],
                    },
                },
            },
        },
    });

    if (!trip) return null;

    return {
        id: trip.id,
        title: trip.title,
        slug: trip.slug,
        access: trip.access,
        days: trip.days.map((day: (typeof trip.days)[number]) => ({
            id: day.id,
            date: day.date.toISOString(),
            items: day.items.map((item: (typeof day.items)[number]) => ({
                id: item.id,
                title: item.title,
                startTime: item.startTime.toISOString(),
                endTime: toIso(item.endTime),
                location: item.location,
                parking: item.parking,
                contact: item.contact,
                memo: item.memo,
            })),
        })),
    };
}
