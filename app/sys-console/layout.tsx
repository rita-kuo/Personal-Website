import { Metadata } from 'next';

export const metadata: Metadata = {
    title: {
        template: "%s - Rita's",
        default: "Rita's System Console",
    },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html>
            <body>{children}</body>
        </html>
    );
}
