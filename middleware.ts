import createMiddleware from 'next-intl/middleware';
import { NextResponse, NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'zh-tw'],

    // Used when no locale matches
    defaultLocale: 'zh-tw',

    // Always keep locale prefix in the URL
    localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname.startsWith('/zh-tw')) {
        return intlMiddleware(request);
    }

    const localeRegex = /^\/zh-TW(?=\/|$)/i;

    if (localeRegex.test(pathname)) {
        url.pathname = pathname.replace(localeRegex, '/zh-tw');
        return NextResponse.redirect(url);
    }

    return intlMiddleware(request);
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(zh-TW|zh-tw|en)/:path*'],
};
