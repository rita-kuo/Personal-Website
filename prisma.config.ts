const config = {
    datasources: {
        db: {
            provider: 'postgresql',
            // Migrate and CLI will read the URL from here at runtime
            url: process.env.DATABASE_URL,
        },
    },
};

export default config;
