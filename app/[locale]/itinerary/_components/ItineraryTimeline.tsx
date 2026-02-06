'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from '../itinerary.module.css';
import Link from 'next/link';

type ItineraryItem = {
    id: number;
    startTime: string;
    endTime?: string | null;
    title: string;
    location?: string | null;
    parking?: string | null;
    contact?: string | null;
    memo?: string | null;
    memoImages?: string[];
};

type ItineraryDay = {
    id: number;
    date: string;
    items: ItineraryItem[];
};

type ItineraryMessages = {
    title: string;
    daySwitch: {
        prev: string;
        next: string;
        label: string;
    };
    labels: {
        time: string;
        location: string;
        parking: string;
        contact: string;
        memo: string;
        detailTitle: string;
        noMemo: string;
        emptyDay: string;
        emptySelection: string;
        noLinks: string;
        notAvailable: string;
        weekdays: string[];
    };
    aria: {
        prevDay: string;
        nextDay: string;
        location: string;
        parking: string;
        contact: string;
    };
    data: {
        days: ItineraryDay[];
    };
};

type Props = {
    messages: ItineraryMessages;
    days: ItineraryDay[];
};

const formatTime = (value: string | null | undefined) => {
    if (!value) return '';
    const date = new Date(value);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

const getWeekdayLabel = (date: Date, labels: string[]) => {
    const index = date.getDay();
    return labels[index] ?? '';
};

const formatDayTitle = (day: ItineraryDay, labels: string[]) => {
    const date = new Date(day.date);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(date.getDate()).padStart(2, '0');
    const weekday = getWeekdayLabel(date, labels);
    return `${month}/${dayOfMonth} ${weekday}`;
};

const getDefaultSelectionId = (day: ItineraryDay) => {
    const now = new Date();
    const startedWithMemo = day.items.filter((item) => {
        const itemDate = new Date(item.startTime);
        return itemDate <= now && Boolean(item.memo);
    });

    if (startedWithMemo.length === 0) return null;
    return startedWithMemo[startedWithMemo.length - 1].id;
};

const formatTimeRange = (item: ItineraryItem) => {
    const startTime = formatTime(item.startTime);
    const endTime = formatTime(item.endTime ?? null);
    if (!endTime) return startTime;
    return `${startTime} - ${endTime}`;
};

export default function ItineraryTimeline({ messages, days }: Props) {
    const weekdayLabels = useMemo(
        () => messages?.labels?.weekdays ?? [],
        [messages],
    );
    const hasDays = days.length > 0;
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

    useEffect(() => {
        if (!hasDays) {
            setSelectedItemId(null);
            setSelectedDayIndex(0);
            return;
        }
        if (selectedDayIndex > days.length - 1) {
            setSelectedDayIndex(0);
            return;
        }
        setSelectedItemId(getDefaultSelectionId(days[selectedDayIndex]));
    }, [days, hasDays, selectedDayIndex]);

    const selectedDay = days[selectedDayIndex];
    const items = selectedDay?.items ?? [];
    const selectedItem = items.find((item) => item.id === selectedItemId);

    const handlePrevDay = () => {
        if (!hasDays) return;
        setSelectedDayIndex((prev) => Math.max(prev - 1, 0));
    };

    const handleNextDay = () => {
        if (!hasDays) return;
        setSelectedDayIndex((prev) => Math.min(prev + 1, days.length - 1));
    };

    return (
        <main className={`container ${styles.page}`}>
            <header className={styles.detailHeader}>
                <h1 className={styles.pageTitle}>{messages.title}</h1>
                <div className={styles.daySwitch}>
                    <button
                        type='button'
                        className={styles.dayButton}
                        onClick={handlePrevDay}
                        aria-label={messages.aria.prevDay}
                        disabled={!hasDays || selectedDayIndex === 0}
                    >
                        <i
                            className={`ri-arrow-left-s-line ${styles.icon}`}
                            aria-hidden='true'
                        />
                    </button>
                    <label className={styles.daySelectLabel}>
                        <span className={styles.visuallyHidden}>
                            {messages.daySwitch.label}
                        </span>
                        <select
                            className={styles.daySelect}
                            value={selectedDayIndex}
                            disabled={!hasDays}
                            onChange={(event) =>
                                setSelectedDayIndex(Number(event.target.value))
                            }
                        >
                            {hasDays ? (
                                days.map((day, index) => (
                                    <option key={day.id} value={index}>
                                        {formatDayTitle(day, weekdayLabels)}
                                    </option>
                                ))
                            ) : (
                                <option value={0}>—</option>
                            )}
                        </select>
                    </label>
                    <button
                        type='button'
                        className={styles.dayButton}
                        onClick={handleNextDay}
                        aria-label={messages.aria.nextDay}
                        disabled={
                            !hasDays || selectedDayIndex === days.length - 1
                        }
                    >
                        <i
                            className={`ri-arrow-right-s-line ${styles.icon}`}
                            aria-hidden='true'
                        />
                    </button>
                </div>
            </header>

            {items.length === 0 ? (
                <article className={styles.emptyCard}>
                    <p className={styles.emptyText}>
                        {messages.labels.emptyDay}
                    </p>
                </article>
            ) : (
                <ol className={`${styles.timelineList} ${styles.compactList}`}>
                    {items.map((item, index) => (
                        <li key={item.id} className={styles.timelineItem}>
                            <div className={styles.itemInfo}>
                                <span>{item.title}</span>
                                <div className={styles.details}>
                                    <div className={styles.baseInfo}>
                                        <span className={styles.time}>
                                            {formatTimeRange(item)}
                                        </span>
                                        <div className={styles.links}>
                                            {item.location && (
                                                <Link
                                                    href={item.location}
                                                    className={styles.linkIcon}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    aria-label={
                                                        messages.aria.location
                                                    }
                                                >
                                                    <i
                                                        className='ri-map-pin-line'
                                                        aria-label={
                                                            messages.aria
                                                                .location
                                                        }
                                                    />
                                                </Link>
                                            )}
                                            {item.parking && (
                                                <Link
                                                    href={item.parking}
                                                    className={styles.linkIcon}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    aria-label={
                                                        messages.aria.parking
                                                    }
                                                >
                                                    <i
                                                        className='ri-parking-box-line'
                                                        aria-label={
                                                            messages.aria
                                                                .parking
                                                        }
                                                    />
                                                </Link>
                                            )}
                                            {item.contact && (
                                                <Link
                                                    href={item.contact}
                                                    className={styles.linkIcon}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    aria-label={
                                                        messages.aria.contact
                                                    }
                                                >
                                                    <i
                                                        className='ri-contacts-line'
                                                        aria-label={
                                                            messages.aria
                                                                .contact
                                                        }
                                                    />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    {item.memo && (
                                        <article className={styles.detailCard}>
                                            {item.memo}
                                        </article>
                                    )}
                                </div>
                            </div>
                            {index < items.length - 1 && (
                                <div
                                    className={styles.connectorCompact}
                                    aria-hidden='true'
                                >
                                    <i
                                        className={`ri-car-line ${styles.carIcon}`}
                                    />
                                </div>
                            )}
                        </li>
                    ))}
                </ol>
            )}
        </main>
    );
}
