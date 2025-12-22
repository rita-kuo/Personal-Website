import { Metadata } from 'next';
import '@picocss/pico/css/pico.min.css';
import '../globals.css';

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
        <html data-theme='light'>
            <body>{children}</body>
        </html>
    );
}
