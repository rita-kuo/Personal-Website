import { PrismaClient } from '@prisma/client';

declare global {
    // allow global `var` across module reloads in development
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined;
}

const prisma =
    global.__prisma ??
    new PrismaClient({ datasourceUrl: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== 'production') global.__prisma = prisma;

export default prisma;
