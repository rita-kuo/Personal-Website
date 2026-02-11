'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import styles from '../itinerary-new.module.css';
import { createItineraryTrip } from '@/app/sys-console/(protected)/itinerary/actions';

type ItineraryNewMessages = {
    itineraryNew: {
        title: string;
        labels: {
            name: string;
            startDate: string;
            endDate: string;
            create: string;
            creating: string;
            cancel: string;
        };
        validation: {
            required: string;
            endBeforeStart: string;
        };
        departureTitle: string;
    };
};

type FormValues = {
    title: string;
    startDate: string;
    endDate: string;
};

export default function ItineraryTripForm({
    messages,
}: {
    messages: ItineraryNewMessages;
}) {
    const t = messages.itineraryNew;
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            title: '',
            startDate: '',
            endDate: '',
        },
    });

    const onSubmit = handleSubmit(async (values) => {
        setIsSaving(true);
        const result = await createItineraryTrip({
            title: values.title,
            startDate: values.startDate,
            departureTitle: t.departureTitle,
        });
        setIsSaving(false);

        if (result?.id) {
            router.push(`/sys-console/itinerary/${result.id}`);
            router.refresh();
        }
    });

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>{t.title}</h1>
            </header>

            <form className={styles.form} onSubmit={onSubmit}>
                <label className={styles.formLabel}>
                    {t.labels.name}
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
                        {t.labels.startDate}
                        <input
                            type='date'
                            className={styles.input}
                            {...register('startDate', {
                                required: t.validation.required,
                            })}
                        />
                        {errors.startDate && (
                            <span className={styles.errorText}>
                                {errors.startDate.message}
                            </span>
                        )}
                    </label>
                    <label className={styles.formLabel}>
                        {t.labels.endDate}
                        <input
                            type='date'
                            className={styles.input}
                            {...register('endDate', {
                                validate: (value) => {
                                    if (!value) return true;
                                    const start = getValues('startDate');
                                    if (start && value < start) {
                                        return t.validation.endBeforeStart;
                                    }
                                    return true;
                                },
                            })}
                        />
                        {errors.endDate && (
                            <span className={styles.errorText}>
                                {errors.endDate.message}
                            </span>
                        )}
                    </label>
                </div>

                <div className={styles.actions}>
                    <button
                        type='button'
                        className={styles.deleteButton}
                        onClick={() => router.push('/sys-console/itinerary')}
                    >
                        {t.labels.cancel}
                    </button>
                    <button
                        type='submit'
                        className={styles.primaryButton}
                        disabled={isSaving}
                    >
                        {isSaving ? t.labels.creating : t.labels.create}
                    </button>
                </div>
            </form>
        </section>
    );
}
