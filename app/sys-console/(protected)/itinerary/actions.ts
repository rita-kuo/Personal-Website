'use server';

import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

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

type AddAfterPayload = {
    dayId: number;
    afterItemId: number;
};

type DeleteItemPayload = {
    dayId: number;
    itemId: number;
};

type SaveTripPayload = {
    tripId: number;
    title: string;
    slug: string;
    days: Array<{
        id: number;
        date: string;
        items: Array<{
            id: number;
            title: string;
            startTime: string;
            endTime: string | null;
            location: string | null;
            parking: string | null;
            contact: string | null;
            memo: string | null;
        }>;
    }>;
};

type SaveTripResult = {
    trip?: {
        id: number;
        title: string;
        slug: string;
        days: CreateDayResult['days'];
    };
    error?: 'TRIP_NOT_FOUND' | 'SLUG_EXISTS' | 'SAVE_FAILED';
};

type UpdateTripMetaPayload = {
    tripId: number;
    title: string;
    slug: string;
};

type UpdateTripMetaResult = {
    trip?: {
        id: number;
        title: string;
        slug: string;
    };
    error?: 'TRIP_NOT_FOUND' | 'SLUG_EXISTS' | 'SAVE_FAILED';
};

type DeleteTripPayload = {
    tripId: number;
};

type DeleteTripResult = {
    error?: 'TRIP_NOT_FOUND' | 'DELETE_FAILED';
};

type CreateTripPayload = {
    title: string;
    departureTitle: string;
    startDate: string;
};

type CreateDayPayload = {
    tripId: number;
    departureTitle: string;
    date?: string;
};

type AddDayAfterPayload = {
    tripId: number;
    dayId: number;
    departureTitle: string;
};

type CreateDayResult = {
    days?: Array<{
        id: number;
        date: string;
        items: Array<{
            id: number;
            title: string;
            startTime: string;
            endTime: string | null;
            location: string | null;
            parking: string | null;
            contact: string | null;
            memo: string | null;
        }>;
    }>;
    error?: 'TRIP_NOT_FOUND' | 'INVALID_DATE' | 'DUPLICATE_DATE';
};

type DeleteDayPayload = {
    tripId: number;
    dayId: number;
    skipShift?: boolean;
};

type DeleteDayResult = {
    days?: CreateDayResult['days'];
    error?: 'TRIP_NOT_FOUND' | 'DAY_NOT_FOUND';
};

type AddDayAfterResult = {
    days?: CreateDayResult['days'];
    newDayId?: number;
    error?: 'TRIP_NOT_FOUND' | 'DAY_NOT_FOUND';
};

type UpdateDayDatePayload = {
    tripId: number;
    dayId: number;
    date: string;
};

type UpdateDayDateResult = {
    days?: CreateDayResult['days'];
    error?: 'TRIP_NOT_FOUND' | 'DAY_NOT_FOUND' | 'INVALID_DATE';
};

type ReorderDayPayload = {
    tripId: number;
    dayId: number;
    targetDayId: number;
};

type ReorderDayResult = {
    days?: CreateDayResult['days'];
    error?: 'TRIP_NOT_FOUND' | 'DAY_NOT_FOUND';
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

const startOfDate = (value: string) => {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
};

const addDays = (date: Date, amount: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
};

const diffDays = (next: Date, prev: Date) => {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round((next.getTime() - prev.getTime()) / msPerDay);
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

const serializeTrip = (trip: any) => ({
    id: trip.id,
    title: trip.title,
    slug: trip.slug,
    days: trip.days.map((day: any) => serializeDay(day)),
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

    const itemIndex = day.items.findIndex((item) => item.id === payload.itemId);

    if (itemIndex === -1) return null;

    const currentItem = day.items[itemIndex];
    const oldEnd = currentItem.endTime;
    const newStart = combineDateAndTime(day.date, payload.startTime);
    const newEnd = payload.endTime
        ? combineDateAndTime(day.date, payload.endTime)
        : null;

    const deltaMs = oldEnd && newEnd ? newEnd.getTime() - oldEnd.getTime() : 0;

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
            const updates = day.items.slice(itemIndex + 1).map((item) => {
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

export async function addItineraryItemAfter(payload: AddAfterPayload) {
    const day = await prisma.itineraryDay.findUnique({
        where: { id: payload.dayId },
        include: {
            items: {
                orderBy: [{ startTime: 'asc' }],
            },
        },
    });

    if (!day) return null;

    const afterIndex = day.items.findIndex(
        (item) => item.id === payload.afterItemId,
    );
    const afterItem = day.items[afterIndex];
    if (!afterItem) return null;

    const baseTime = afterItem.endTime
        ? new Date(afterItem.endTime)
        : new Date(afterItem.startTime);
    const nextItem = day.items[afterIndex + 1];
    const baseMs = baseTime.getTime();
    const nextMs = nextItem ? new Date(nextItem.startTime).getTime() : null;
    const shiftMs = 60 * 1000;

    let newStart = new Date(baseMs + shiftMs);
    let shouldShiftNextItems = false;

    if (nextMs === null) {
        newStart = new Date(baseMs + shiftMs);
    } else {
        const diff = nextMs - baseMs;
        if (diff <= shiftMs) {
            shouldShiftNextItems = true;
            newStart = new Date(baseMs + Math.max(1000, Math.floor(diff / 2)));
        } else {
            newStart = new Date(baseMs + Math.floor(diff / 2));
        }
    }

    await prisma.$transaction(async (tx) => {
        if (shouldShiftNextItems) {
            const itemsToShift = day.items.slice(afterIndex + 1);
            await Promise.all(
                itemsToShift.map((item) => {
                    const shiftedStart = new Date(
                        item.startTime.getTime() + shiftMs,
                    );
                    const shiftedEnd = item.endTime
                        ? new Date(item.endTime.getTime() + shiftMs)
                        : null;
                    return tx.itineraryItem.update({
                        where: { id: item.id },
                        data: {
                            startTime: shiftedStart,
                            endTime: shiftedEnd,
                        },
                    });
                }),
            );
        }

        await tx.itineraryItem.create({
            data: {
                dayId: day.id,
                title: '',
                startTime: newStart,
                endTime: null,
                location: null,
                parking: null,
                contact: null,
                memo: null,
            },
        });
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

export async function deleteItineraryItem(payload: DeleteItemPayload) {
    await prisma.itineraryItem.delete({
        where: { id: payload.itemId },
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

export async function saveItineraryTrip(
    payload: SaveTripPayload,
): Promise<SaveTripResult> {
    try {
        const result = await prisma.$transaction(async (tx) => {
            const trip = await tx.itineraryTrip.findUnique({
                where: { id: payload.tripId },
            });

            if (!trip) return { error: 'TRIP_NOT_FOUND' } as SaveTripResult;

            await tx.itineraryTrip.update({
                where: { id: payload.tripId },
                data: {
                    title: payload.title,
                    slug: payload.slug,
                },
            });

            const updates = payload.days.flatMap((day) =>
                day.items.map((item) =>
                    tx.itineraryItem.update({
                        where: { id: item.id },
                        data: {
                            title: item.title,
                            startTime: new Date(item.startTime),
                            endTime: item.endTime
                                ? new Date(item.endTime)
                                : null,
                            location: item.location,
                            parking: item.parking,
                            contact: item.contact,
                            memo: item.memo,
                        },
                    }),
                ),
            );

            await Promise.all(updates);

            const refreshed = await tx.itineraryTrip.findUnique({
                where: { id: payload.tripId },
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

            if (!refreshed) {
                return { error: 'TRIP_NOT_FOUND' } as SaveTripResult;
            }

            return { trip: serializeTrip(refreshed) } as SaveTripResult;
        });

        return result;
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            return { error: 'SLUG_EXISTS' };
        }
        return { error: 'SAVE_FAILED' };
    }
}

export async function updateItineraryTripMeta(
    payload: UpdateTripMetaPayload,
): Promise<UpdateTripMetaResult> {
    try {
        const trip = await prisma.itineraryTrip.update({
            where: { id: payload.tripId },
            data: {
                title: payload.title,
                slug: payload.slug,
            },
        });

        return {
            trip: {
                id: trip.id,
                title: trip.title,
                slug: trip.slug,
            },
        };
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            return { error: 'SLUG_EXISTS' };
        }
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            return { error: 'TRIP_NOT_FOUND' };
        }
        return { error: 'SAVE_FAILED' };
    }
}

export async function deleteItineraryTrip(
    payload: DeleteTripPayload,
): Promise<DeleteTripResult> {
    try {
        await prisma.itineraryTrip.delete({
            where: { id: payload.tripId },
        });
        return {};
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            return { error: 'TRIP_NOT_FOUND' };
        }
        return { error: 'DELETE_FAILED' };
    }
}

export async function createItineraryTrip(payload: CreateTripPayload) {
    const slug = `trip-${Date.now()}`;
    const dayDate = startOfDate(payload.startDate);
    if (!dayDate) return { error: 'INVALID_DATE' };

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

export async function createItineraryDay(
    payload: CreateDayPayload,
): Promise<CreateDayResult> {
    const trip = await prisma.itineraryTrip.findUnique({
        where: { id: payload.tripId },
        include: {
            days: {
                orderBy: [{ date: 'asc' }],
                select: { date: true },
            },
        },
    });

    if (!trip) return { error: 'TRIP_NOT_FOUND' };

    let dayDate: Date | null = null;
    if (payload.date) {
        dayDate = startOfDate(payload.date);
        if (!dayDate) return { error: 'INVALID_DATE' };
        const exists = await prisma.itineraryDay.findFirst({
            where: {
                tripId: payload.tripId,
                date: dayDate,
            },
            select: { id: true },
        });
        if (exists) return { error: 'DUPLICATE_DATE' };
    }

    if (!dayDate) {
        const lastDate = trip.days[trip.days.length - 1]?.date ?? null;
        dayDate = lastDate ? addDays(lastDate, 1) : startOfToday();
    }

    await prisma.itineraryDay.create({
        data: {
            tripId: trip.id,
            date: dayDate,
            items: {
                create: {
                    title: payload.departureTitle,
                    startTime: combineDateAndTime(dayDate, '08:00'),
                    endTime: null,
                },
            },
        },
    });

    const updatedTrip = await prisma.itineraryTrip.findUnique({
        where: { id: payload.tripId },
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

    if (!updatedTrip) return { error: 'TRIP_NOT_FOUND' };

    return {
        days: updatedTrip.days.map((day) => ({
            id: day.id,
            date: day.date.toISOString(),
            items: day.items.map((item) => ({
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

export async function addItineraryDayAfter(
    payload: AddDayAfterPayload,
): Promise<AddDayAfterResult> {
    const trip = await prisma.itineraryTrip.findUnique({
        where: { id: payload.tripId },
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

    if (!trip) return { error: 'TRIP_NOT_FOUND' };

    const targetIndex = trip.days.findIndex((day) => day.id === payload.dayId);
    const targetDay = trip.days[targetIndex];
    if (!targetDay) return { error: 'DAY_NOT_FOUND' };

    const newDate = addDays(targetDay.date, 1);
    const daysToShift = trip.days.slice(targetIndex + 1);

    let newDayId: number | null = null;

    await prisma.$transaction(async (tx) => {
        if (daysToShift.length) {
            const descending = [...daysToShift].reverse();
            await Promise.all(
                descending.map(async (day) => {
                    const shiftedDate = addDays(day.date, 1);
                    await tx.itineraryDay.update({
                        where: { id: day.id },
                        data: { date: shiftedDate },
                    });

                    await Promise.all(
                        day.items.map((item) => {
                            const shiftedStart = addDays(item.startTime, 1);
                            const shiftedEnd = item.endTime
                                ? addDays(item.endTime, 1)
                                : null;
                            return tx.itineraryItem.update({
                                where: { id: item.id },
                                data: {
                                    startTime: shiftedStart,
                                    endTime: shiftedEnd,
                                },
                            });
                        }),
                    );
                }),
            );
        }

        const created = await tx.itineraryDay.create({
            data: {
                tripId: payload.tripId,
                date: newDate,
                items: {
                    create: {
                        title: payload.departureTitle,
                        startTime: combineDateAndTime(newDate, '08:00'),
                        endTime: null,
                    },
                },
            },
        });

        newDayId = created.id;
    });

    const updatedTrip = await prisma.itineraryTrip.findUnique({
        where: { id: payload.tripId },
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

    if (!updatedTrip) return { error: 'TRIP_NOT_FOUND' };

    return {
        newDayId: newDayId ?? undefined,
        days: updatedTrip.days.map((day) => serializeDay(day)),
    };
}

export async function deleteItineraryDay(
    payload: DeleteDayPayload,
): Promise<DeleteDayResult> {
    const trip = await prisma.itineraryTrip.findUnique({
        where: { id: payload.tripId },
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

    if (!trip) return { error: 'TRIP_NOT_FOUND' };

    const targetIndex = trip.days.findIndex((day) => day.id === payload.dayId);
    const targetDay = trip.days[targetIndex];
    if (!targetDay) return { error: 'DAY_NOT_FOUND' };

    const daysToShift = trip.days.slice(targetIndex + 1);

    await prisma.$transaction(async (tx) => {
        await tx.itineraryDay.delete({
            where: { id: payload.dayId },
        });

        if (!trip.days.findIndex((day) => day.id === payload.dayId)) {
            return;
        }

        for (const day of daysToShift) {
            const shiftedDate = addDays(day.date, -1);
            await tx.itineraryDay.update({
                where: { id: day.id },
                data: { date: shiftedDate },
            });

            await Promise.all(
                day.items.map((item) => {
                    const shiftedStart = addDays(item.startTime, -1);
                    const shiftedEnd = item.endTime
                        ? addDays(item.endTime, -1)
                        : null;
                    return tx.itineraryItem.update({
                        where: { id: item.id },
                        data: {
                            startTime: shiftedStart,
                            endTime: shiftedEnd,
                        },
                    });
                }),
            );
        }
    });

    const updatedTrip = await prisma.itineraryTrip.findUnique({
        where: { id: payload.tripId },
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

    if (!updatedTrip) return { error: 'TRIP_NOT_FOUND' };

    return {
        days: updatedTrip.days.map((dayItem) => serializeDay(dayItem)),
    };
}

export async function updateItineraryDayDate(
    payload: UpdateDayDatePayload,
): Promise<UpdateDayDateResult> {
    const targetDate = startOfDate(payload.date);
    if (!targetDate) return { error: 'INVALID_DATE' };

    const trip = await prisma.itineraryTrip.findUnique({
        where: { id: payload.tripId },
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

    if (!trip) return { error: 'TRIP_NOT_FOUND' };

    const targetDay = trip.days.find((day) => day.id === payload.dayId);
    if (!targetDay) return { error: 'DAY_NOT_FOUND' };

    const delta = diffDays(targetDate, targetDay.date);
    if (delta === 0) {
        return { days: trip.days.map((day) => serializeDay(day)) };
    }

    await prisma.$transaction(async (tx) => {
        const bufferDays = trip.days.length + 1;

        await Promise.all(
            trip.days.map(async (day) => {
                const tempDate = addDays(day.date, delta + bufferDays);
                await tx.itineraryDay.update({
                    where: { id: day.id },
                    data: { date: tempDate },
                });
            }),
        );

        await Promise.all(
            trip.days.map(async (day) => {
                const nextDate = addDays(day.date, delta);
                await tx.itineraryDay.update({
                    where: { id: day.id },
                    data: { date: nextDate },
                });

                if (day.items.length === 0) return;

                await Promise.all(
                    day.items.map((item) => {
                        const shiftedStart = addDays(item.startTime, delta);
                        const shiftedEnd = item.endTime
                            ? addDays(item.endTime, delta)
                            : null;
                        return tx.itineraryItem.update({
                            where: { id: item.id },
                            data: {
                                startTime: shiftedStart,
                                endTime: shiftedEnd,
                            },
                        });
                    }),
                );
            }),
        );
    });

    const updatedTrip = await prisma.itineraryTrip.findUnique({
        where: { id: payload.tripId },
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

    if (!updatedTrip) return { error: 'TRIP_NOT_FOUND' };

    return {
        days: updatedTrip.days.map((day) => serializeDay(day)),
    };
}

export async function reorderItineraryDays(
    payload: ReorderDayPayload,
): Promise<ReorderDayResult> {
    const trip = await prisma.itineraryTrip.findUnique({
        where: { id: payload.tripId },
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

    if (!trip) return { error: 'TRIP_NOT_FOUND' };

    const dayIds = trip.days.map((day) => day.id);
    const fromIndex = dayIds.indexOf(payload.dayId);
    const toIndex = dayIds.indexOf(payload.targetDayId);

    if (fromIndex === -1 || toIndex === -1) {
        return { error: 'DAY_NOT_FOUND' };
    }

    if (fromIndex === toIndex) {
        return { days: trip.days.map((day) => serializeDay(day)) };
    }

    const nextIds = [...dayIds];
    const [moved] = nextIds.splice(fromIndex, 1);
    nextIds.splice(toIndex, 0, moved);

    const baseDate = trip.days[0]?.date;
    if (!baseDate) {
        return { days: [] };
    }

    const dayMap = new Map(trip.days.map((day) => [day.id, day]));

    await prisma.$transaction(async (tx) => {
        const bufferDays = nextIds.length + 1;

        await Promise.all(
            nextIds.map(async (dayId, index) => {
                const day = dayMap.get(dayId);
                if (!day) return;
                const tempDate = addDays(baseDate, index + bufferDays);

                await tx.itineraryDay.update({
                    where: { id: day.id },
                    data: { date: tempDate },
                });
            }),
        );

        await Promise.all(
            nextIds.map(async (dayId, index) => {
                const day = dayMap.get(dayId);
                if (!day) return;
                const nextDate = addDays(baseDate, index);
                const delta = diffDays(nextDate, day.date);

                await tx.itineraryDay.update({
                    where: { id: day.id },
                    data: { date: nextDate },
                });

                if (delta === 0 || day.items.length === 0) return;

                await Promise.all(
                    day.items.map((item) => {
                        const shiftedStart = addDays(item.startTime, delta);
                        const shiftedEnd = item.endTime
                            ? addDays(item.endTime, delta)
                            : null;
                        return tx.itineraryItem.update({
                            where: { id: item.id },
                            data: {
                                startTime: shiftedStart,
                                endTime: shiftedEnd,
                            },
                        });
                    }),
                );
            }),
        );
    });

    const updatedTrip = await prisma.itineraryTrip.findUnique({
        where: { id: payload.tripId },
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

    if (!updatedTrip) return { error: 'TRIP_NOT_FOUND' };

    return {
        days: updatedTrip.days.map((day) => serializeDay(day)),
    };
}
