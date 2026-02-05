'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../itinerary-list.module.css';
import modalStyles from '../itinerary-modal.module.css';
import { createItineraryTrip } from '@/app/sys-console/(protected)/itinerary/actions';

type TripListItem = {
    id: number;
    title: string;
    startDate: string | null;
    endDate: string | null;
};

type ItineraryListMessages = {
    itineraryList: {
        title: string;
        empty: string;
        add: string;
        departureTitle: string;
        list: {
            startDate: string;
            endDate: string;
        };
        modal: {
            title: string;
            nameLabel: string;
            startDateLabel: string;
            cancel: string;
            create: string;
            creating: string;
        };
        validation: {
            required: string;
        };
    };
};

type FormValues = {
    title: string;
    startDate: string;
};

const formatDateInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDate = (value: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const currentYear = new Date().getFullYear();
    return year === currentYear ? `${month}/${day}` : `${year}/${month}/${day}`;
};

export default function ItineraryTripList({
    trips,
    messages,
}: {
    trips: TripListItem[];
    messages: ItineraryListMessages;
}) {
    const t = messages.itineraryList;
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { register, handleSubmit, reset, formState } = useForm<FormValues>({
        defaultValues: { title: '', startDate: formatDateInput(new Date()) },
    });

    const closeModal = () => {
        setIsOpen(false);
        reset({ title: '', startDate: formatDateInput(new Date()) });
    };

    const onSubmit = handleSubmit(async (values) => {
        setIsSaving(true);
        const result = await createItineraryTrip({
            title: values.title,
            departureTitle: t.departureTitle,
            startDate: values.startDate,
        });
        setIsSaving(false);

        if (result?.id) {
            closeModal();
            router.push(`/sys-console/itinerary/${result.id}`);
        }
    });

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{t.title}</h1>
                <button
                    type='button'
                    className={styles.addButton}
                    onClick={() => setIsOpen(true)}
                >
                    <i className='ri-add-line' aria-hidden='true' />
                    {t.add}
                </button>
            </header>

            <div className={styles.list}>
                {trips.length === 0 ? (
                    <article className={styles.emptyCard}>
                        <p className={styles.emptyText}>{t.empty}</p>
                    </article>
                ) : (
                    trips.map((trip) => (
                        <Link
                            key={trip.id}
                            href={`/sys-console/itinerary/${trip.id}`}
                            className={styles.item}
                        >
                            <div className={styles.itemContent}>
                                <h2 className={styles.itemName}>
                                    {trip.title}
                                </h2>
                                <div className={styles.itemMeta}>
                                    <span>{t.list.startDate}</span>
                                    <span className={styles.metaValue}>
                                        {formatDate(trip.startDate)}
                                    </span>
                                    <span>{t.list.endDate}</span>
                                    <span className={styles.metaValue}>
                                        {formatDate(trip.endDate)}
                                    </span>
                                </div>
                            </div>
                            <i
                                className={`ri-arrow-right-s-line ${styles.arrow}`}
                                aria-hidden='true'
                            />
                        </Link>
                    ))
                )}
            </div>

            {isOpen && (
                <div
                    className={`${modalStyles.backdrop} ${
                        modalStyles.backdropOpen
                    }`}
                >
                    <div
                        className={`${modalStyles.modal} ${
                            modalStyles.modalOpen
                        }`}
                    >
                        <header className={modalStyles.header}>
                            <h2 className={modalStyles.title}>
                                {t.modal.title}
                            </h2>
                            <button
                                type='button'
                                className={modalStyles.closeButton}
                                onClick={closeModal}
                                aria-label={t.modal.cancel}
                            >
                                <i
                                    className='ri-close-line'
                                    aria-hidden='true'
                                />
                            </button>
                        </header>
                        <form className={modalStyles.form} onSubmit={onSubmit}>
                            <label className={modalStyles.formLabel}>
                                {t.modal.nameLabel}
                                <input
                                    type='text'
                                    className={modalStyles.input}
                                    {...register('title', {
                                        required: t.validation.required,
                                    })}
                                />
                                {formState.errors.title && (
                                    <span className={modalStyles.errorText}>
                                        {formState.errors.title.message}
                                    </span>
                                )}
                            </label>
                            <label className={modalStyles.formLabel}>
                                {t.modal.startDateLabel || t.list.startDate}
                                <input
                                    type='date'
                                    className={modalStyles.input}
                                    {...register('startDate', {
                                        required: t.validation.required,
                                    })}
                                />
                                {formState.errors.startDate && (
                                    <span className={modalStyles.errorText}>
                                        {formState.errors.startDate.message}
                                    </span>
                                )}
                            </label>
                            <div className={modalStyles.actions}>
                                <button
                                    type='button'
                                    className={modalStyles.secondaryButton}
                                    onClick={closeModal}
                                >
                                    {t.modal.cancel}
                                </button>
                                <button
                                    type='submit'
                                    className={modalStyles.primaryButton}
                                    disabled={isSaving}
                                >
                                    {isSaving
                                        ? t.modal.creating
                                        : t.modal.create}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
