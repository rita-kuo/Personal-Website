'use server';

import prisma from '@/lib/db';

type UpdatePayload = {
    dayId: number;
    itemId: number;
    title: string;
    startTime: string;
    endTime: string;
    location: string;
    parking: string;
    contact: string;
    memo: string;
};

type AddPayload = {
    dayId: number;
};

type CreateTripPayload = {
    title: string;
    departureTitle: string;
};

const combineDateAndTime = (dateValue: Date, timeValue: string) => {
    const [hours, minutes] = timeValue.split(':').map(Number);
    const combined = new Date(dateValue);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
};

const startOfToday = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
};

const toIso = (value: Date | null) => (value ? value.toISOString() : null);

const serializeDay = (day: any) => ({
    id: day.id,
    date: day.date.toISOString(),
    items: day.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        startTime: item.startTime.toISOString(),
        endTime: toIso(item.endTime),
        location: item.location,
        parking: item.parking,
        contact: item.contact,
        memo: item.memo,
    })),
});

export async function updateItineraryItem(payload: UpdatePayload) {
    const day = await prisma.itineraryDay.findUnique({
        where: { id: payload.dayId },
        include: {
            items: {
                orderBy: [{ startTime: 'asc' }],
            },
        },
    });

    if (!day) return null;

    const itemIndex = day.items.findIndex(
        (item) => item.id === payload.itemId
    );

    if (itemIndex === -1) return null;

    const currentItem = day.items[itemIndex];
    const oldEnd = currentItem.endTime;
    const newStart = combineDateAndTime(day.date, payload.startTime);
    const newEnd = payload.endTime
        ? combineDateAndTime(day.date, payload.endTime)
        : null;

    const deltaMs =
        oldEnd && newEnd ? newEnd.getTime() - oldEnd.getTime() : 0;

    await prisma.$transaction(async (tx) => {
        await tx.itineraryItem.update({
            where: { id: payload.itemId },
            data: {
                title: payload.title,
                startTime: newStart,
                endTime: newEnd,
                location: payload.location || null,
                parking: payload.parking || null,
                contact: payload.contact || null,
                memo: payload.memo || null,
            },
        });

        if (deltaMs !== 0) {
            const updates = day.items
                .slice(itemIndex + 1)
                .map((item) => {
                    const nextStart = new Date(item.startTime.getTime() + deltaMs);
                    const nextEnd = item.endTime
                        ? new Date(item.endTime.getTime() + deltaMs)
                        : null;
                    return tx.itineraryItem.update({
                        where: { id: item.id },
                        data: {
                            startTime: nextStart,
                            endTime: nextEnd,
                        },
                    });
                });
            await Promise.all(updates);
        }
    });

    const updatedDay = await prisma.itineraryDay.findUnique({
        where: { id: payload.dayId },
        include: {
            items: {
                orderBy: [{ startTime: 'asc' }],
            },
        },
    });

    return updatedDay ? serializeDay(updatedDay) : null;
}

export async function addItineraryItem(payload: AddPayload) {
    const day = await prisma.itineraryDay.findUnique({
        where: { id: payload.dayId },
        include: {
            items: {
                orderBy: [{ startTime: 'asc' }],
            },
        },
    });

    if (!day) return null;

    const lastItem = day.items[day.items.length - 1];
    const fallbackStart = combineDateAndTime(day.date, '09:00');
    const nextStart = lastItem?.endTime
        ? new Date(lastItem.endTime)
        : lastItem?.startTime
        ? new Date(lastItem.startTime)
        : fallbackStart;

    await prisma.itineraryItem.create({
        data: {
            dayId: day.id,
            title: '',
            startTime: nextStart,
            endTime: null,
            location: null,
            parking: null,
            contact: null,
            memo: null,
        },
    });

    const updatedDay = await prisma.itineraryDay.findUnique({
        where: { id: payload.dayId },
        include: {
            items: {
                orderBy: [{ startTime: 'asc' }],
            },
        },
    });

    return updatedDay ? serializeDay(updatedDay) : null;
}

export async function createItineraryTrip(payload: CreateTripPayload) {
    const slug = `trip-${Date.now()}`;
    const dayDate = startOfToday();

    const trip = await prisma.itineraryTrip.create({
        data: {
            title: payload.title,
            slug,
            days: {
                create: {
                    date: dayDate,
                    items: {
                        create: {
                            title: payload.departureTitle,
                            startTime: combineDateAndTime(dayDate, '08:00'),
                            endTime: null,
                        },
                    },
                },
            },
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

    return {
        id: trip.id,
        title: trip.title,
    };
}
