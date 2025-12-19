import 'dotenv/config';

// Export plain config object for Prisma CLI parsing
export default {
    // `datasource` (singular) required by `prisma migrate dev`
    datasource: {
        url: process.env.DATABASE_URL,
    },
};
