'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
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
};

type ItineraryDay = {
    id: string;
    date: string;
    weekday: string;
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
            };
            validation: {
                required: string;
                invalidUrl: string;
                endBeforeStart: string;
                tooLong: string;
            };
        };
    };
    itinerary: {
        data: {
            days: ItineraryDay[];
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
    const started = day.items.filter((item) => {
        const itemMinutes = toMinutes(item.startTime);
        return itemMinutes !== null && itemMinutes <= nowMinutes;
    });

    if (started.length === 0) return null;
    return started[started.length - 1].id;
};

const isValidUrl = (value: string) =>
    value.length === 0 || /^https?:\/\//.test(value);

const addMinutesToTime = (time: string | null | undefined, delta: number) => {
    const minutes = toMinutes(time);
    if (minutes === null) return time ?? '';
    const total = Math.min(Math.max(minutes + delta, 0), 23 * 60 + 59);
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

export default function ItineraryAdmin({
    messages,
}: {
    messages: AdminMessages;
}) {
    const t = messages.sys.itinerary;
    const initialDays = useMemo(
        () => messages.itinerary?.data?.days ?? [],
        [messages]
    );

    const [days, setDays] = useState<ItineraryDay[]>(initialDays);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const selectedDay = days[selectedDayIndex];
    const items = selectedDay?.items ?? [];
    const selectedItem = items.find((item) => item.id === selectedItemId);
    const selectedItemIndex = items.findIndex(
        (item) => item.id === selectedItemId
    );

    useEffect(() => {
        if (days.length === 0) return;
        setSelectedItemId(getDefaultSelectionId(days[selectedDayIndex]));
    }, [days, selectedDayIndex]);

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
            startTime: selectedItem.startTime ?? '',
            endTime: selectedItem.endTime ?? '',
            location: selectedItem.location ?? '',
            parking: selectedItem.parking ?? '',
            contact: selectedItem.contact ?? '',
            memo: selectedItem.memo ?? '',
        });
    }, [reset, selectedItem]);

    const onSubmit = handleSubmit((values) => {
        if (!selectedDay || !selectedItemId) return;
        if (selectedItemIndex < 0) return;
        setIsSaving(true);
        const oldEnd = selectedItem?.endTime ?? null;
        const newEnd = values.endTime || null;
        const oldEndMinutes = toMinutes(oldEnd);
        const newEndMinutes = toMinutes(newEnd);
        const deltaMinutes =
            oldEndMinutes !== null && newEndMinutes !== null
                ? newEndMinutes - oldEndMinutes
                : 0;

        setDays((prev) =>
            prev.map((day, dayIndex) => {
                if (dayIndex !== selectedDayIndex) return day;
                return {
                    ...day,
                    items: day.items.map((item, index) => {
                        if (item.id === selectedItemId) {
                            return {
                                ...item,
                                title: values.title,
                                startTime: values.startTime,
                                endTime: values.endTime || null,
                                location: values.location || null,
                                parking: values.parking || null,
                                contact: values.contact || null,
                                memo: values.memo || null,
                            };
                        }

                        if (deltaMinutes !== 0 && index > selectedItemIndex) {
                            return {
                                ...item,
                                startTime: addMinutesToTime(
                                    item.startTime,
                                    deltaMinutes
                                ),
                                endTime: item.endTime
                                    ? addMinutesToTime(
                                          item.endTime,
                                          deltaMinutes
                                      )
                                    : null,
                            };
                        }

                        return item;
                    }),
                };
            })
        );
        setTimeout(() => setIsSaving(false), 400);
    });

    const handleAddItem = () => {
        if (!selectedDay) return;
        const newItem: ItineraryItem = {
            id: `temp-${Date.now()}`,
            startTime: '',
            endTime: '',
            title: '',
            location: '',
            parking: '',
            contact: '',
            memo: '',
        };

        setDays((prev) =>
            prev.map((day, index) =>
                index === selectedDayIndex
                    ? { ...day, items: [...day.items, newItem] }
                    : day
            )
        );
        setSelectedItemId(newItem.id);
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
                        disabled={selectedDayIndex === 0}
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
                        onClick={() =>
                            setSelectedDayIndex((prev) =>
                                Math.min(prev + 1, days.length - 1)
                            )
                        }
                        aria-label={t.daySwitch.next}
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
                                <li
                                    key={item.id}
                                    className={styles.timelineItem}
                                >
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
                                            {item.title}
                                        </span>
                                        <span className={styles.compactTime}>
                                            {item.startTime}
                                            {item.endTime
                                                ? ` - ${item.endTime}`
                                                : ''}
                                        </span>
                                    </button>
                                    {index < items.length - 1 && (
                                        <div
                                            className={styles.connectorCompact}
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
                    </div>
                    <div className={styles.detailColumn}>
                        <article
                            className={`${styles.card} ${styles.detailCard}`}
                        >
                            <h2 className={styles.sectionTitle}>
                                {t.labels.editor}
                            </h2>
                            {!selectedItem ? (
                                <p className={styles.emptyText}>
                                    {t.labels.emptySelection}
                                </p>
                            ) : (
                                <form
                                    className={styles.form}
                                    onSubmit={onSubmit}
                                >
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
                                                    required:
                                                        t.validation.required,
                                                })}
                                            />
                                            {errors.startTime && (
                                                <span
                                                    className={styles.errorText}
                                                >
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
                                                        const start = toMinutes(
                                                            getValues(
                                                                'startTime'
                                                            )
                                                        );
                                                        const end =
                                                            toMinutes(value);
                                                        if (
                                                            start !== null &&
                                                            end !== null &&
                                                            end < start
                                                        ) {
                                                            return t.validation
                                                                .endBeforeStart;
                                                        }
                                                        return true;
                                                    },
                                                })}
                                            />
                                            {errors.endTime && (
                                                <span
                                                    className={styles.errorText}
                                                >
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
                                        {isSaving
                                            ? t.labels.saving
                                            : t.labels.save}
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
