import { Metadata } from 'next';
import { getMessages } from '@/lib/getMessages';
import CenteredCardLayout from '../_components/CenteredCardLayout';

type Props = {
    params:
        | { locale: string; gameSlug: string }
        | Promise<{ locale: string; gameSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const resolved = await params;
    const { messages } = await getMessages(resolved.locale, 'gamePlay');

    return {
        title: messages.levelNotFoundTitle ?? '',
    };
}

export default async function LevelNotFoundPage({ params }: Props) {
    const resolved = await params;
    const { messages } = await getMessages(resolved.locale, 'gamePlay');

    return (
        <CenteredCardLayout
            title={messages.levelNotFoundTitle}
            description={messages.levelNotFoundBody}
        />
    );
}
