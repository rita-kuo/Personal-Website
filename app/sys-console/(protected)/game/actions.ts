'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/db';

export async function createGame(data: any) {
    const session = await auth();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const { name, slug, levels } = data;

    try {
        const game = await prisma.game.create({
            data: {
                name,
                slug,
                levels: {
                    create: levels.map((level: any, index: number) => ({
                        name: level.name,
                        slug: level.slug,
                        order: index,
                        details: {
                            create: level.details.map((detail: any) => ({
                                actionType: detail.actionType || 'NONE',
                                content: detail.content,
                                meta: detail.meta,
                            })),
                        },
                    })),
                },
            },
        });
        return { success: true, id: game.id };
    } catch (error) {
        console.error('Failed to create game:', error);
        return { success: false, error: 'Failed to create game' };
    }
}

export async function getGame(id: number) {
    const session = await auth();
    if (!session) {
        throw new Error('Unauthorized');
    }

    try {
        const game = await prisma.game.findUnique({
            where: { id },
            include: {
                levels: {
                    orderBy: { order: 'asc' },
                    include: {
                        details: {
                            orderBy: { id: 'asc' }, // Assuming details are ordered by ID for now, or add an order field
                        },
                    },
                },
            },
        });
        return game;
    } catch (error) {
        console.error('Failed to get game:', error);
        return null;
    }
}

export async function updateGame(id: number, data: any) {
    const session = await auth();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const { name, slug, levels } = data;

    try {
        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // 1. Update Game basic info
            await tx.game.update({
                where: { id },
                data: { name, slug },
            });

            // 2. Delete existing levels (and cascade details)
            // Note: This is a simple approach. For better performance or preserving IDs,
            // we would need a diffing algorithm.
            await tx.level.deleteMany({
                where: { gameId: id },
            });

            // 3. Create new levels with details
            for (const [index, level] of levels.entries()) {
                await tx.level.create({
                    data: {
                        gameId: id,
                        name: level.name,
                        slug: level.slug,
                        order: index,
                        details: {
                            create: level.details.map((detail: any) => ({
                                name: detail.name,
                                actionType: detail.actionType || 'NONE',
                                content: detail.content,
                                meta: detail.meta,
                            })),
                        },
                    },
                });
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to update game:', error);
        return { success: false, error: 'Failed to update game' };
    }
}

export async function deleteGame(id: number) {
    const session = await auth();
    if (!session) {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.game.delete({
            where: { id },
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to delete game:', error);
        return { success: false, error: 'Failed to delete game' };
    }
}
