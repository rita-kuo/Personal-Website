'use client';

import Link from 'next/link';
import styles from '../itinerary.module.css';

type TripListItem = {
    id: number;
    title: string;
    slug: string;
    startDate: string | null;
    endDate: string | null;
};

type ItineraryListMessages = {
    title: string;
    labels: {
        notAvailable: string;
    };
    list: {
        empty: string;
        viewTrip: string;
    };
};

type Props = {
    trips: TripListItem[];
    messages: ItineraryListMessages;
    locale: string;
};

const formatDate = (value: string | null, locale: string, fallback: string) => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
};

export default function ItineraryTripList({ trips, messages, locale }: Props) {
    const hasTrips = trips.length > 0;
    const fallback = messages.labels.notAvailable;

    return (
        <>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>{messages.title}</h1>
            </header>
            {hasTrips ? (
                <div className={styles.tripList}>
                    {trips.map((trip) => {
                        const startText = formatDate(
                            trip.startDate,
                            locale,
                            fallback,
                        );
                        const endText = formatDate(
                            trip.endDate,
                            locale,
                            fallback,
                        );
                        return (
                            <Link
                                key={trip.id}
                                href={`/${locale}/itinerary/${trip.slug}`}
                                className={styles.tripCard}
                            >
                                <div className={styles.tripInfo}>
                                    <h2 className={styles.tripTitle}>
                                        {trip.title}
                                    </h2>
                                    <div className={styles.tripMeta}>
                                        {startText} - {endText}
                                    </div>
                                </div>
                                <div className={styles.tripAction}>
                                    <span className={styles.tripActionText}>
                                        {messages.list.viewTrip}
                                    </span>
                                    <i
                                        className={`ri-arrow-right-s-line ${styles.tripArrow}`}
                                        aria-hidden='true'
                                    />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <article className={styles.emptyCard}>
                    <p className={styles.emptyText}>{messages.list.empty}</p>
                </article>
            )}
        </>
    );
}
