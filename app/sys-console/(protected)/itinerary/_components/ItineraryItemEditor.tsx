import { useFormContext } from 'react-hook-form';
import styles from '../itinerary.module.css';

type ItineraryItem = {
    id: number;
    startTime: string;
    endTime: string | null;
    title: string;
    location: string | null;
    parking: string | null;
    contact: string | null;
    memo: string | null;
};

type ItineraryDay = {
    id: number;
    date: string;
    items: ItineraryItem[];
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

type ItineraryItemEditorProps = {
    t: {
        labels: {
            editor: string;
            title: string;
            timeStart: string;
            timeEnd: string;
            location: string;
            parking: string;
            contact: string;
            memo: string;
            deleteItem: string;
            emptySelection: string;
            saveTrip: string;
            savingTrip: string;
        };
        validation: {
            required: string;
            invalidUrl: string;
            endBeforeStart: string;
            tooLong: string;
        };
    };
    selectedItem: ItineraryItem | undefined;
    selectedDay: ItineraryDay | undefined;
    isDirty: boolean;
    isSaving: boolean;
    errorText?: string;
    onSave: () => void;
    onDelete: () => void;
    updateSelectedItem: (updates: Partial<ItineraryItem>) => void;
};

const mergeDateAndTime = (dateValue: string, timeValue: string) => {
    const [hours, minutes] = timeValue.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    const combined = new Date(dateValue);
    combined.setHours(hours, minutes, 0, 0);
    return combined.toISOString();
};

const isValidUrl = (value: string) =>
    value.length === 0 || /^https?:\/\//.test(value);

export default function ItineraryItemEditor({
    t,
    selectedItem,
    selectedDay,
    isDirty,
    isSaving,
    errorText,
    onSave,
    onDelete,
    updateSelectedItem,
}: ItineraryItemEditorProps) {
    const {
        register,
        getValues,
        formState: { errors },
    } = useFormContext<FormValues>();

    return (
        <article className={`${styles.card} ${styles.detailCard}`}>
            <div className={styles.detailHeader}>
                <h2 className={styles.sectionTitle}>{t.labels.editor}</h2>
                <div className={styles.headerActions}>
                    <button
                        type='button'
                        className={styles.primaryButton}
                        onClick={onSave}
                        disabled={!isDirty || isSaving}
                    >
                        {isSaving ? t.labels.savingTrip : t.labels.saveTrip}
                    </button>
                    <button
                        type='button'
                        className={styles.secondaryButton}
                        onClick={onDelete}
                        disabled={!selectedItem}
                    >
                        {t.labels.deleteItem}
                    </button>
                </div>
            </div>
            {errorText && <p className={styles.errorText}>{errorText}</p>}
            {!selectedItem ? (
                <p className={styles.emptyText}>{t.labels.emptySelection}</p>
            ) : (
                <form className={styles.form}>
                    <label className={styles.formLabel}>
                        {t.labels.title}
                        <input
                            type='text'
                            className={styles.input}
                            {...register('title', {
                                required: t.validation.required,
                                onChange: (event) =>
                                    updateSelectedItem({
                                        title: event.target.value,
                                    }),
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
                                    onChange: (event) => {
                                        if (!selectedDay) return;
                                        const merged = mergeDateAndTime(
                                            selectedDay.date,
                                            event.target.value,
                                        );
                                        if (merged) {
                                            updateSelectedItem({
                                                startTime: merged,
                                            });
                                        }
                                    },
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
                                    onChange: (event) => {
                                        if (!selectedDay) return;
                                        const value = event.target.value;
                                        if (!value) {
                                            updateSelectedItem({
                                                endTime: null,
                                            });
                                            return;
                                        }
                                        const merged = mergeDateAndTime(
                                            selectedDay.date,
                                            value,
                                        );
                                        if (merged) {
                                            updateSelectedItem({
                                                endTime: merged,
                                            });
                                        }
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
                                onChange: (event) =>
                                    updateSelectedItem({
                                        location: event.target.value || null,
                                    }),
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
                                onChange: (event) =>
                                    updateSelectedItem({
                                        parking: event.target.value || null,
                                    }),
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
                                onChange: (event) =>
                                    updateSelectedItem({
                                        contact: event.target.value || null,
                                    }),
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
                                    value.length <= 500 || t.validation.tooLong,
                                onChange: (event) =>
                                    updateSelectedItem({
                                        memo: event.target.value || null,
                                    }),
                            })}
                        />
                        {errors.memo && (
                            <span className={styles.errorText}>
                                {errors.memo.message}
                            </span>
                        )}
                    </label>
                </form>
            )}
        </article>
    );
}
