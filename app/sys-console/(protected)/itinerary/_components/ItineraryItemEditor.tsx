import { useFormContext } from 'react-hook-form';
import styles from '../itinerary.module.css';
import QuillEditor from '@/app/sys-console/_components/QuillEditor';

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
            timeInvalid: string;
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

const isValidTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

const toMinutes = (value: string) => {
    if (!isValidTime(value)) return null;
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
};

const isValidUrl = (value: string) =>
    value.length === 0 || /^https?:\/\//.test(value);

export default function ItineraryItemEditor({
    t,
    selectedItem,
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
        setValue,
        watch,
        formState: { errors },
    } = useFormContext<FormValues>();

    const memoValue = watch('memo');

    const handleMemoChange = (html: string) => {
        const isEmpty = !html || html.replace(/<[^>]*>/g, '').trim() === '';
        const clean = isEmpty ? '' : html;
        if (clean === memoValue) return;
        setValue('memo', clean, { shouldDirty: true });
        updateSelectedItem({ memo: clean || null });
    };

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
                        className={styles.deleteButton}
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
                                type='text'
                                inputMode='numeric'
                                autoComplete='off'
                                className={styles.input}
                                {...register('startTime', {
                                    required: t.validation.required,
                                    validate: (value) =>
                                        isValidTime(value) ||
                                        t.validation.timeInvalid,
                                    onChange: () => updateSelectedItem({}),
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
                                type='text'
                                inputMode='numeric'
                                autoComplete='off'
                                className={styles.input}
                                {...register('endTime', {
                                    validate: (value) => {
                                        if (!value) return true;
                                        if (!isValidTime(value)) {
                                            return t.validation.timeInvalid;
                                        }
                                        const start = getValues('startTime');
                                        const startMinutes = start
                                            ? toMinutes(start)
                                            : null;
                                        const endMinutes = toMinutes(value);
                                        if (
                                            startMinutes !== null &&
                                            endMinutes !== null &&
                                            endMinutes < startMinutes
                                        ) {
                                            return t.validation.endBeforeStart;
                                        }
                                        return true;
                                    },
                                    onChange: () => updateSelectedItem({}),
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
                    <div className={styles.formLabel}>
                        <span>{t.labels.memo}</span>
                        <QuillEditor
                            className={styles.quillWrapper}
                            value={memoValue}
                            onChange={handleMemoChange}
                        />
                    </div>
                </form>
            )}
        </article>
    );
}
