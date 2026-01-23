import { Metadata } from 'next';
import { getMessages } from '@/lib/getMessages';
import styles from './level-not-found.module.css';

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
        <main className={styles.container}>
            <div className={styles.wrapper}>
                <article className={styles.card}>
                    <i className={`ri-prohibited-2-line ${styles.watermark}`} />
                    <div className={styles.cardContent}>
                        <header>
                            <h2 className={styles.title}>
                                {messages.levelNotFoundTitle}
                            </h2>
                        </header>
                        <p className={styles.description}>
                            {messages.levelNotFoundBody}
                        </p>
                    </div>
                </article>
            </div>
        </main>
    );
}
