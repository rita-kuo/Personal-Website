'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from '../itinerary.module.css';

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
        [messages]
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
            <header className={styles.header}>
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
                        disabled={!hasDays || selectedDayIndex === days.length - 1}
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
                <>
                    <section className={styles.mobileTimeline}>
                        <ol className={styles.timelineList}>
                            {items.map((item, index) => (
                                <li
                                    key={item.id}
                                    className={styles.timelineItem}
                                >
                                    <article className={styles.card}>
                                        <div className={styles.cardHeader}>
                                            <span className={styles.timeText}>
                                                {formatTimeRange(item)}
                                            </span>
                                            <h2 className={styles.itemTitle}>
                                                {item.title}
                                            </h2>
                                        </div>
                                        <div className={styles.linkGroup}>
                                            {item.location && (
                                                <a
                                                    href={item.location}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    className={styles.linkPill}
                                                    aria-label={
                                                        messages.aria.location
                                                    }
                                                >
                                                    <i
                                                        className={`ri-map-pin-line ${styles.pillIcon}`}
                                                        aria-hidden='true'
                                                    />
                                                    {messages.labels.location}
                                                </a>
                                            )}
                                            {item.parking && (
                                                <a
                                                    href={item.parking}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    className={styles.linkPill}
                                                    aria-label={
                                                        messages.aria.parking
                                                    }
                                                >
                                                    <i
                                                        className={`ri-parking-line ${styles.pillIcon}`}
                                                        aria-hidden='true'
                                                    />
                                                    {messages.labels.parking}
                                                </a>
                                            )}
                                            {item.contact && (
                                                <a
                                                    href={item.contact}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    className={styles.linkPill}
                                                    aria-label={
                                                        messages.aria.contact
                                                    }
                                                >
                                                    <i
                                                        className={`ri-message-3-line ${styles.pillIcon}`}
                                                        aria-hidden='true'
                                                    />
                                                    {messages.labels.contact}
                                                </a>
                                            )}
                                            {!item.location &&
                                                !item.parking &&
                                                !item.contact && (
                                                    <span
                                                        className={
                                                            styles.linkPlaceholder
                                                        }
                                                    >
                                                        {
                                                            messages.labels
                                                                .noLinks
                                                        }
                                                    </span>
                                                )}
                                        </div>
                                        {item.memo ? (
                                            <details className={styles.memo}>
                                                <summary
                                                    className={
                                                        styles.memoSummary
                                                    }
                                                >
                                                    {messages.labels.memo}
                                                </summary>
                                                <p className={styles.memoText}>
                                                    {item.memo}
                                                </p>
                                            </details>
                                        ) : (
                                            <p className={styles.noMemoText}>
                                                {messages.labels.noMemo}
                                            </p>
                                        )}
                                    </article>
                                    {index < items.length - 1 && (
                                        <div
                                            className={styles.connector}
                                            aria-hidden='true'
                                        >
                                            <span
                                                className={styles.connectorLine}
                                            />
                                            <i
                                                className={`ri-car-line ${styles.carIcon}`}
                                            />
                                            <span
                                                className={styles.connectorLine}
                                            />
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </section>

                    <section className={styles.desktopLayout}>
                        <div className={styles.timelineColumn}>
                            <ol
                                className={`${styles.timelineList} ${styles.compactList}`}
                            >
                                {items.map((item, index) => {
                                    const isSelected =
                                        item.id === selectedItemId;
                                    const isDisabled = !item.memo;

                                    return (
                                        <li
                                            key={item.id}
                                            className={styles.timelineItem}
                                        >
                                            <button
                                                type='button'
                                                className={`${
                                                    styles.compactButton
                                                } ${
                                                    isSelected
                                                        ? styles.isSelected
                                                        : ''
                                                } ${
                                                    isDisabled
                                                        ? styles.isDisabled
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    !isDisabled &&
                                                    setSelectedItemId(item.id)
                                                }
                                                disabled={isDisabled}
                                            >
                                                <span
                                                    className={
                                                        styles.compactTitle
                                                    }
                                                >
                                                    {item.title}
                                                </span>
                                                <span
                                                    className={
                                                        styles.compactTime
                                                    }
                                                >
                                                    {formatTimeRange(item)}
                                                </span>
                                            </button>
                                            {index < items.length - 1 && (
                                                <div
                                                    className={
                                                        styles.connectorCompact
                                                    }
                                                    aria-hidden='true'
                                                >
                                                    <span
                                                        className={
                                                            styles.connectorLine
                                                        }
                                                    />
                                                    <i
                                                        className={`ri-car-line ${styles.carIcon}`}
                                                    />
                                                    <span
                                                        className={
                                                            styles.connectorLine
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                        <div className={styles.detailColumn}>
                            {selectedItem ? (
                                <article
                                    className={`${styles.card} ${styles.detailCard}`}
                                >
                                    <h2 className={styles.detailTitle}>
                                        {messages.labels.detailTitle}
                                    </h2>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>
                                            {messages.labels.time}
                                        </span>
                                        <span className={styles.detailValue}>
                                            {formatTimeRange(selectedItem)}
                                        </span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>
                                            {messages.labels.location}
                                        </span>
                                        <span className={styles.detailValue}>
                                            {selectedItem.location ? (
                                                <a
                                                    href={selectedItem.location}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    className={styles.textLink}
                                                    aria-label={
                                                        messages.aria.location
                                                    }
                                                >
                                                    {messages.labels.location}
                                                </a>
                                            ) : (
                                                <span
                                                    className={styles.mutedText}
                                                >
                                                    {
                                                        messages.labels
                                                            .notAvailable
                                                    }
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>
                                            {messages.labels.parking}
                                        </span>
                                        <span className={styles.detailValue}>
                                            {selectedItem.parking ? (
                                                <a
                                                    href={selectedItem.parking}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    className={styles.textLink}
                                                    aria-label={
                                                        messages.aria.parking
                                                    }
                                                >
                                                    {messages.labels.parking}
                                                </a>
                                            ) : (
                                                <span
                                                    className={styles.mutedText}
                                                >
                                                    {
                                                        messages.labels
                                                            .notAvailable
                                                    }
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>
                                            {messages.labels.contact}
                                        </span>
                                        <span className={styles.detailValue}>
                                            {selectedItem.contact ? (
                                                <a
                                                    href={selectedItem.contact}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    className={styles.textLink}
                                                    aria-label={
                                                        messages.aria.contact
                                                    }
                                                >
                                                    {messages.labels.contact}
                                                </a>
                                            ) : (
                                                <span
                                                    className={styles.mutedText}
                                                >
                                                    {
                                                        messages.labels
                                                            .notAvailable
                                                    }
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <span className={styles.detailLabel}>
                                            {messages.labels.memo}
                                        </span>
                                        <span className={styles.detailValue}>
                                            {selectedItem.memo ? (
                                                <span
                                                    className={
                                                        styles.memoParagraph
                                                    }
                                                >
                                                    {selectedItem.memo}
                                                </span>
                                            ) : (
                                                <span
                                                    className={styles.mutedText}
                                                >
                                                    {messages.labels.noMemo}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </article>
                            ) : (
                                <article className={styles.emptyCard}>
                                    <p className={styles.emptyText}>
                                        {messages.labels.emptySelection}
                                    </p>
                                </article>
                            )}
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}
