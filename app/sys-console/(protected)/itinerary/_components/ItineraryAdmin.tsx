'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import styles from '../itinerary.module.css';
import { addItineraryItem, updateItineraryItem } from '@/app/sys-console/(protected)/itinerary/actions';

type ItineraryItem = {
    id: number;
    startTime: string;
    endTime?: string | null;
    title: string;
    location?: string | null;
    parking?: string | null;
    contact?: string | null;
    memo?: string | null;
};

type ItineraryDay = {
    id: number;
    date: string;
    items: ItineraryItem[];
};

type AdminMessages = {
    sys: {
        itinerary: {
            title: string;
            daySwitch: {
                prev: string;
                next: string;
                label: string;
            };
            labels: {
                timeline: string;
                editor: string;
                timeStart: string;
                timeEnd: string;
                title: string;
                location: string;
                parking: string;
                contact: string;
                memo: string;
                save: string;
                saving: string;
                addItem: string;
                emptySelection: string;
                emptyDay: string;
                weekdays: string[];
            };
            validation: {
                required: string;
                invalidUrl: string;
                endBeforeStart: string;
                tooLong: string;
            };
        };
    };
};

type FormValues = {
    title: string;
    startTime: string;
    endTime: string;
    location: string;
    parking: string;
    contact: string;
    memo: string;
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
    const started = day.items.filter((item) => {
        const itemDate = new Date(item.startTime);
        return itemDate <= now;
    });

    if (started.length === 0) return null;
    return started[started.length - 1].id;
};

const isValidUrl = (value: string) =>
    value.length === 0 || /^https?:\/\//.test(value);

export default function ItineraryAdmin({
    messages,
    days: initialDays,
}: {
    messages: AdminMessages;
    days: ItineraryDay[];
}) {
    const t = messages.sys.itinerary;
    const [days, setDays] = useState<ItineraryDay[]>(initialDays);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const hasDays = days.length > 0;

    const selectedDay = days[selectedDayIndex];
    const items = selectedDay?.items ?? [];
    const selectedItem = items.find((item) => item.id === selectedItemId);
    const selectedItemIndex = items.findIndex(
        (item) => item.id === selectedItemId
    );

    const weekdayLabels = useMemo(() => t.labels.weekdays ?? [], [t.labels]);

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

    const form = useForm<FormValues>({
        defaultValues: {
            title: '',
            startTime: '',
            endTime: '',
            location: '',
            parking: '',
            contact: '',
            memo: '',
        },
    });

    const {
        register,
        handleSubmit,
        reset,
        getValues,
        formState: { errors },
    } = form;

    useEffect(() => {
        if (!selectedItem) return;
        reset({
            title: selectedItem.title ?? '',
            startTime: formatTime(selectedItem.startTime) ?? '',
            endTime: formatTime(selectedItem.endTime ?? null) ?? '',
            location: selectedItem.location ?? '',
            parking: selectedItem.parking ?? '',
            contact: selectedItem.contact ?? '',
            memo: selectedItem.memo ?? '',
        });
    }, [reset, selectedItem]);

    const onSubmit = handleSubmit(async (values) => {
        if (!selectedDay || selectedItemIndex < 0 || !selectedItemId) return;
        setIsSaving(true);

        const updatedDay = await updateItineraryItem({
            dayId: selectedDay.id,
            itemId: selectedItemId,
            title: values.title,
            startTime: values.startTime,
            endTime: values.endTime,
            location: values.location,
            parking: values.parking,
            contact: values.contact,
            memo: values.memo,
        });

        if (updatedDay) {
            setDays((prev) =>
                prev.map((day) => (day.id === updatedDay.id ? updatedDay : day))
            );
        }

        setIsSaving(false);
    });

    const handleAddItem = async () => {
        if (!selectedDay) return;
        const updatedDay = await addItineraryItem({
            dayId: selectedDay.id,
        });

        if (updatedDay) {
            setDays((prev) =>
                prev.map((day) => (day.id === updatedDay.id ? updatedDay : day))
            );
            const newestItem = updatedDay.items[updatedDay.items.length - 1];
            if (newestItem) {
                setSelectedItemId(newestItem.id);
            }
        }
    };

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>{t.title}</h1>
                <div className={styles.daySwitch}>
                    <button
                        type='button'
                        className={styles.dayButton}
                        onClick={() =>
                            setSelectedDayIndex((prev) => Math.max(prev - 1, 0))
                        }
                        aria-label={t.daySwitch.prev}
                        disabled={!hasDays || selectedDayIndex === 0}
                    >
                        <i
                            className={`ri-arrow-left-s-line ${styles.icon}`}
                            aria-hidden='true'
                        />
                    </button>
                    <label className={styles.daySelectLabel}>
                        <span className={styles.visuallyHidden}>
                            {t.daySwitch.label}
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
                        onClick={() =>
                            setSelectedDayIndex((prev) =>
                                Math.min(prev + 1, days.length - 1)
                            )
                        }
                        aria-label={t.daySwitch.next}
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
                    <p className={styles.emptyText}>{t.labels.emptyDay}</p>
                </article>
            ) : (
                <div className={styles.desktopLayoutAdmin}>
                    <div className={styles.timelineColumn}>
                        <div className={styles.timelineHeader}>
                            <h2 className={styles.sectionTitle}>
                                {t.labels.timeline}
                            </h2>
                            <button
                                type='button'
                                className={styles.primaryButton}
                                onClick={handleAddItem}
                            >
                                <i
                                    className={`ri-add-line ${styles.buttonIcon}`}
                                    aria-hidden='true'
                                />
                                {t.labels.addItem}
                            </button>
                        </div>
                        <ol
                            className={`${styles.timelineList} ${styles.compactList}`}
                        >
                            {items.map((item, index) => (
                                <li key={item.id} className={styles.timelineItem}>
                                    <button
                                        type='button'
                                        className={`${styles.compactButton} ${
                                            item.id === selectedItemId
                                                ? styles.isSelected
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setSelectedItemId(item.id)
                                        }
                                    >
                                        <span className={styles.compactTitle}>
                                            {item.title || t.labels.title}
                                        </span>
                                        <span className={styles.compactTime}>
                                            {formatTime(item.startTime)}
                                            {item.endTime
                                                ? ` - ${formatTime(item.endTime)}`
                                                : ''}
                                        </span>
                                    </button>
                                    {index < items.length - 1 && (
                                        <div
                                            className={styles.connectorCompact}
                                            aria-hidden='true'
                                        >
                                            <span className={styles.connectorLine} />
                                            <i
                                                className={`ri-car-line ${styles.carIcon}`}
                                            />
                                            <span className={styles.connectorLine} />
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div className={styles.detailColumn}>
                        <article className={`${styles.card} ${styles.detailCard}`}>
                            <h2 className={styles.sectionTitle}>
                                {t.labels.editor}
                            </h2>
                            {!selectedItem ? (
                                <p className={styles.emptyText}>
                                    {t.labels.emptySelection}
                                </p>
                            ) : (
                                <form className={styles.form} onSubmit={onSubmit}>
                                    <label className={styles.formLabel}>
                                        {t.labels.title}
                                        <input
                                            type='text'
                                            className={styles.input}
                                            {...register('title', {
                                                required: t.validation.required,
                                            })}
                                        />
                                        {errors.title && (
                                            <span className={styles.errorText}>
                                                {errors.title.message}
                                            </span>
                                        )}
                                    </label>
                                    <div className={styles.formRow}>
                                        <label className={styles.formLabel}>
                                            {t.labels.timeStart}
                                            <input
                                                type='time'
                                                className={styles.input}
                                                {...register('startTime', {
                                                    required: t.validation.required,
                                                })}
                                            />
                                            {errors.startTime && (
                                                <span className={styles.errorText}>
                                                    {errors.startTime.message}
                                                </span>
                                            )}
                                        </label>
                                        <label className={styles.formLabel}>
                                            {t.labels.timeEnd}
                                            <input
                                                type='time'
                                                className={styles.input}
                                                {...register('endTime', {
                                                    validate: (value) => {
                                                        if (!value) return true;
                                                        const start = getValues('startTime');
                                                        if (start && value < start) {
                                                            return t.validation.endBeforeStart;
                                                        }
                                                        return true;
                                                    },
                                                })}
                                            />
                                            {errors.endTime && (
                                                <span className={styles.errorText}>
                                                    {errors.endTime.message}
                                                </span>
                                            )}
                                        </label>
                                    </div>
                                    <label className={styles.formLabel}>
                                        {t.labels.location}
                                        <input
                                            type='url'
                                            className={styles.input}
                                            {...register('location', {
                                                validate: (value) =>
                                                    isValidUrl(value) ||
                                                    t.validation.invalidUrl,
                                            })}
                                        />
                                        {errors.location && (
                                            <span className={styles.errorText}>
                                                {errors.location.message}
                                            </span>
                                        )}
                                    </label>
                                    <label className={styles.formLabel}>
                                        {t.labels.parking}
                                        <input
                                            type='url'
                                            className={styles.input}
                                            {...register('parking', {
                                                validate: (value) =>
                                                    isValidUrl(value) ||
                                                    t.validation.invalidUrl,
                                            })}
                                        />
                                        {errors.parking && (
                                            <span className={styles.errorText}>
                                                {errors.parking.message}
                                            </span>
                                        )}
                                    </label>
                                    <label className={styles.formLabel}>
                                        {t.labels.contact}
                                        <input
                                            type='url'
                                            className={styles.input}
                                            {...register('contact', {
                                                validate: (value) =>
                                                    isValidUrl(value) ||
                                                    t.validation.invalidUrl,
                                            })}
                                        />
                                        {errors.contact && (
                                            <span className={styles.errorText}>
                                                {errors.contact.message}
                                            </span>
                                        )}
                                    </label>
                                    <label className={styles.formLabel}>
                                        {t.labels.memo}
                                        <textarea
                                            className={styles.textarea}
                                            rows={4}
                                            {...register('memo', {
                                                validate: (value) =>
                                                    value.length <= 500 ||
                                                    t.validation.tooLong,
                                            })}
                                        />
                                        {errors.memo && (
                                            <span className={styles.errorText}>
                                                {errors.memo.message}
                                            </span>
                                        )}
                                    </label>
                                    <button
                                        type='submit'
                                        className={styles.primaryButton}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? t.labels.saving : t.labels.save}
                                    </button>
                                </form>
                            )}
                        </article>
                    </div>
                </div>
            )}
        </section>
    );
}
