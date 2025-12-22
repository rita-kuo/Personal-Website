/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // using a dynamic `app/[locale]` route for locale handling
    // Do not enable Next.js built-in `i18n` here to avoid routing conflicts
};

export default nextConfig;
