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
