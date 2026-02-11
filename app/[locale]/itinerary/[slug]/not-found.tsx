import { cookies } from 'next/headers';
import { getMessages } from '@/lib/getMessages';
import styles from '../itinerary.module.css';

export default async function ItineraryNotFound() {
    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'zh-tw';
    const { messages } = await getMessages(locale, 'itinerary');
    const t = (messages as any).notFound;

    return (
        <section className={styles.notFoundPage}>
            <article className={styles.notFoundCard}>
                <i
                    className={`ri-compass-discover-line ${styles.notFoundIcon}`}
                    aria-hidden='true'
                />
                <h2 className={styles.notFoundTitle}>{t.title}</h2>
                <p className={styles.notFoundDescription}>{t.description}</p>
            </article>
        </section>
    );
}
