'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from '../itinerary.module.css';

type ItineraryItem = {
    id: string;
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
    id: string;
    date: string;
    weekday: string;
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
};

const toMinutes = (time: string | null | undefined) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
};

const formatDayTitle = (day: ItineraryDay) => {
    const date = new Date(day.date);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(date.getDate()).padStart(2, '0');
    return `${month}/${dayOfMonth} ${day.weekday}`;
};

const getDefaultSelectionId = (day: ItineraryDay) => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const startedWithMemo = day.items.filter((item) => {
        const itemMinutes = toMinutes(item.startTime);
        return (
            itemMinutes !== null &&
            itemMinutes <= nowMinutes &&
            Boolean(item.memo)
        );
    });

    if (startedWithMemo.length === 0) return null;
    return startedWithMemo[startedWithMemo.length - 1].id;
};

const formatTimeRange = (item: ItineraryItem) => {
    if (!item.endTime) return item.startTime;
    return `${item.startTime} - ${item.endTime}`;
};

export default function ItineraryTimeline({ messages }: Props) {
    const days = useMemo(() => messages?.data?.days ?? [], [messages]);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    useEffect(() => {
        if (days.length === 0) return;
        setSelectedItemId(getDefaultSelectionId(days[selectedDayIndex]));
    }, [days, selectedDayIndex]);

    const selectedDay = days[selectedDayIndex];
    const items = selectedDay?.items ?? [];
    const selectedItem = items.find((item) => item.id === selectedItemId);

    const handlePrevDay = () => {
        setSelectedDayIndex((prev) => Math.max(prev - 1, 0));
    };

    const handleNextDay = () => {
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
                        disabled={selectedDayIndex === 0}
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
                            onChange={(event) =>
                                setSelectedDayIndex(Number(event.target.value))
                            }
                        >
                            {days.map((day, index) => (
                                <option key={day.id} value={index}>
                                    {formatDayTitle(day)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button
                        type='button'
                        className={styles.dayButton}
                        onClick={handleNextDay}
                        aria-label={messages.aria.nextDay}
                        disabled={selectedDayIndex === days.length - 1}
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
