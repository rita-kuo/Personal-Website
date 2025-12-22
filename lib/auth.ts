import NextAuth from 'next-auth';
import LineProvider from 'next-auth/providers/line';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/db';

async function updateProfileImage(userId: number, imageUrl: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { image: imageUrl },
        });
    } catch (error) {
        console.error('Failed to update profile image:', error);
    }
}

async function fetchLineProfile(accessToken: string) {
    try {
        const response = await fetch('https://api.line.me/v2/profile', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch LINE profile');
        }

        return await response.json();
    } catch (error) {
        console.error('FetchLineProfileError', error);
        return null;
    }
}

async function refreshAccessToken(token: any) {
    try {
        const url = 'https://api.line.me/oauth2/v2.1/token';
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken,
                client_id: process.env.LINE_CLIENT_ID!,
                client_secret: process.env.LINE_CLIENT_SECRET!,
            }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
            throw refreshedTokens;
        }

        // If we have a userId, try to fetch and update the profile image
        if (token.userId) {
            const profile = await fetchLineProfile(
                refreshedTokens.access_token
            );
            if (profile && profile.pictureUrl) {
                // Don't await this, let it run in background
                updateProfileImage(Number(token.userId), profile.pictureUrl);
            }
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            expiresAt: Math.floor(
                Date.now() / 1000 + refreshedTokens.expires_in
            ),
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.log('RefreshAccessTokenError', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        LineProvider({
            clientId: process.env.LINE_CLIENT_ID,
            clientSecret: process.env.LINE_CLIENT_SECRET,
            authorization: { params: { scope: 'profile openid email' } },
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/sys-console/login',
        error: '/sys-console/login', // Error code passed in query string
    },
    callbacks: {
        async signIn({ user, account }) {
            if (!user.email) return false;

            // Whitelist check: User must exist in DB
            // We bypass the adapter here to check raw DB
            const dbUser = await prisma.user.findUnique({
                where: { email: user.email },
            });

            if (!dbUser) return false; // Deny access if email not found

            // Update profile image if it has changed
            if (user.image && user.image !== dbUser.image) {
                await updateProfileImage(dbUser.id, user.image);
            }

            return true;
        },
        async jwt({ token, account, user }) {
            // Initial sign in
            if (account && user) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    expiresAt: account.expires_at, // NextAuth normalizes this to seconds since epoch
                    userId: user.id,
                };
            }

            // Return previous token if the access token has not expired yet
            // Add a buffer of 10 seconds
            if (Date.now() < (token.expiresAt as number) * 1000 - 10000) {
                return token;
            }

            // Access token has expired, try to update it
            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            if (token.error) {
                // @ts-ignore
                session.error = token.error;
            }
            if (session.user && token.userId) {
                session.user.id = String(token.userId);
            }
            return session;
        },
    },
});
