'use client';

import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { DragEndEvent } from '@dnd-kit/core';
import styles from '../itinerary.module.css';
import ItineraryEmptyState from './ItineraryEmptyState';
import ItineraryHeader from './ItineraryHeader';
import ItineraryItemEditor from './ItineraryItemEditor';
import EditTripModal from './EditTripModal';
import ItineraryDayColumn from './ItineraryDayColumn';
import EditDayDateModal from './EditDayDateModal';
import ItineraryTimelineColumn from './ItineraryTimelineColumn';
import ConfirmModal from '@/app/sys-console/_components/ConfirmModal';
import UnsavedChangesGuard from '@/app/sys-console/_components/UnsavedChangesGuard';
import type { ItineraryAdminMessages } from '@/lib/i18n/types';
import {
    addItineraryItem,
    addItineraryItemAfter,
    createItineraryDay,
    deleteItineraryItem,
    deleteItineraryDay,
    deleteItineraryTrip,
    reorderItineraryDays,
    updateItineraryDayDate,
    updateItineraryTripMeta,
    saveItineraryTrip,
} from '@/app/sys-console/(protected)/itinerary/actions';

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

const formatTime = (value: string | null | undefined) => {
    if (!value) return '';
    const date = new Date(value);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};
const getDefaultSelectionId = (day: ItineraryDay) => {
    return day.items[0]?.id ?? null;
};

export default function ItineraryAdmin({
    messages,
    days: initialDays,
    tripId,
    tripTitle: initialTripTitle,
    tripSlug: initialTripSlug,
}: {
    messages: ItineraryAdminMessages;
    days: ItineraryDay[];
    tripId: number;
    tripTitle: string;
    tripSlug: string;
}) {
    const t = messages.itinerary;
    const router = useRouter();
    const [days, setDays] = useState<ItineraryDay[]>(initialDays);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [tripTitle, setTripTitle] = useState(initialTripTitle);
    const [tripSlug, setTripSlug] = useState(initialTripSlug);
    const [isItemsDirty, setIsItemsDirty] = useState(false);
    const [isSavingTrip, setIsSavingTrip] = useState(false);
    const [tripSaveError, setTripSaveError] = useState('');
    const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false);
    const [isEditDayModalOpen, setIsEditDayModalOpen] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmPayload, setConfirmPayload] = useState<null | {
        title: string;
        body: string;
        cancelLabel: string;
        confirmLabel: string;
        confirmingLabel?: string;
        onConfirm: () => Promise<void>;
    }>(null);

    const hasDays = days.length > 0;
    const selectedDay = days[selectedDayIndex];
    const items = selectedDay?.items ?? [];
    const selectedItem = items.find((item) => item.id === selectedItemId);
    const selectedItemIndex = items.findIndex(
        (item) => item.id === selectedItemId,
    );

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
        const currentDay = days[selectedDayIndex];
        if (!currentDay) return;
        const stillExists = currentDay.items.some(
            (item) => item.id === selectedItemId,
        );
        if (!stillExists) {
            setSelectedItemId(getDefaultSelectionId(currentDay));
        }
    }, [days, hasDays, selectedDayIndex, selectedItemId]);

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
        mode: 'onChange',
    });

    const { reset } = form;

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

    useEffect(() => {
        setIsItemsDirty(false);
        setTripSaveError('');
    }, [selectedDayIndex, selectedItemId]);

    const updateSelectedItem = useCallback(
        (updates: Partial<ItineraryItem>) => {
            if (!selectedDay || !selectedItemId) return;
            setDays((prev) =>
                prev.map((day) => {
                    if (day.id !== selectedDay.id) return day;
                    const nextItems = day.items.map((item) =>
                        item.id === selectedItemId
                            ? { ...item, ...updates }
                            : item,
                    );
                    const sorted = [...nextItems].sort(
                        (a, b) =>
                            new Date(a.startTime).getTime() -
                            new Date(b.startTime).getTime(),
                    );
                    return { ...day, items: sorted };
                }),
            );
            setIsItemsDirty(true);
            setTripSaveError('');
        },
        [selectedDay, selectedItemId],
    );

    const handleSaveItems = useCallback(async () => {
        if (!isItemsDirty) return;
        setIsSavingTrip(true);
        setTripSaveError('');

        const result = await saveItineraryTrip({
            tripId,
            title: tripTitle,
            slug: tripSlug,
            days,
        });

        setIsSavingTrip(false);

        if (result?.error) {
            if (result.error === 'SLUG_EXISTS') {
                setTripSaveError(t.validation.slugDuplicate);
            } else {
                setTripSaveError(t.validation.saveFailed);
            }
            return;
        }

        if (result?.trip) {
            setDays(result.trip.days ?? []);
            setTripTitle(result.trip.title);
            setTripSlug(result.trip.slug);
            setIsItemsDirty(false);
        }
    }, [days, isItemsDirty, tripId, tripSlug, tripTitle, t.validation]);

    const handleInsertItem = async (afterItemId: number) => {
        if (!selectedDay) return;
        const updatedDay = await addItineraryItemAfter({
            dayId: selectedDay.id,
            afterItemId,
        });

        if (updatedDay) {
            setDays((prev) =>
                prev.map((day) =>
                    day.id === updatedDay.id ? updatedDay : day,
                ),
            );
            const newestItem = updatedDay.items[updatedDay.items.length - 1];
            if (newestItem) {
                setSelectedItemId(newestItem.id);
            }
        }
    };

    const handleAddFirstItem = async () => {
        if (!selectedDay) return;
        const updatedDay = await addItineraryItem({
            dayId: selectedDay.id,
        });

        if (updatedDay) {
            setDays((prev) =>
                prev.map((day) =>
                    day.id === updatedDay.id ? updatedDay : day,
                ),
            );
            const newestItem = updatedDay.items[updatedDay.items.length - 1];
            if (newestItem) {
                setSelectedItemId(newestItem.id);
            }
        }
    };

    const handleAddFirstDay = async () => {
        const result = await createItineraryDay({
            tripId,
            departureTitle: t.labels.departureTitle,
        });

        if (result?.days) {
            setDays(result.days);
            setSelectedDayIndex(0);
        }
    };

    const handleAddDayBeforeFirst = async () => {
        if (!days[0]) return;
        const firstDate = new Date(days[0].date);
        firstDate.setDate(firstDate.getDate() - 1);
        const firstDateValue = `${firstDate.getFullYear()}-${String(
            firstDate.getMonth() + 1,
        ).padStart(2, '0')}-${String(firstDate.getDate()).padStart(2, '0')}`;
        const result = await createItineraryDay({
            tripId,
            departureTitle: t.labels.departureTitle,
            date: firstDateValue,
        });

        if (result?.days) {
            setDays(result.days);
            setSelectedDayIndex(0);
        }
    };

    const handleAddDayAfterLast = async () => {
        const result = await createItineraryDay({
            tripId,
            departureTitle: t.labels.departureTitle,
        });

        if (result?.days) {
            setDays(result.days);
            setSelectedDayIndex(result.days.length - 1);
        }
    };

    const closeConfirmModal = () => {
        if (isConfirming) return;
        setConfirmPayload(null);
    };

    const openEditTripModal = () => {
        setIsEditTripModalOpen(true);
    };

    const openEditDayModal = () => {
        if (!selectedDay) return;
        setIsEditDayModalOpen(true);
    };

    const closeEditTripModal = () => {
        setIsEditTripModalOpen(false);
    };

    const closeEditDayModal = () => {
        setIsEditDayModalOpen(false);
    };

    const handleTripMetaSave = async (nextTitle: string, nextSlug: string) => {
        setIsSavingTrip(true);
        setTripSaveError('');

        const result = await updateItineraryTripMeta({
            tripId,
            title: nextTitle,
            slug: nextSlug,
        });

        setIsSavingTrip(false);

        if (result?.error) {
            if (result.error === 'SLUG_EXISTS') {
                setTripSaveError(t.validation.slugDuplicate);
            } else {
                setTripSaveError(t.validation.saveFailed);
            }
            return;
        }

        if (result?.trip) {
            setTripTitle(result.trip.title);
            setTripSlug(result.trip.slug);
        }
    };

    const openDeleteDayModal = (dayId: number, dayIndex: number) => {
        setConfirmPayload({
            title: t.dayDeleteModal.title,
            body: t.dayDeleteModal.body,
            cancelLabel: t.dayDeleteModal.cancel,
            confirmLabel: t.dayDeleteModal.confirm,
            confirmingLabel: t.dayDeleteModal.deleting,
            onConfirm: async () => {
                const result = await deleteItineraryDay({
                    tripId,
                    dayId,
                    skipShift: dayIndex === 0,
                });

                if (result?.days) {
                    setDays(result.days);
                    const nextIndex = result.days.length
                        ? Math.min(dayIndex, result.days.length - 1)
                        : 0;
                    setSelectedDayIndex(nextIndex);
                }
            },
        });
    };

    const openDeleteItemModal = (itemId?: number) => {
        const targetId = itemId ?? selectedItemId;
        if (!selectedDay || !targetId) return;

        setSelectedItemId(targetId);
        setConfirmPayload({
            title: t.itemDeleteModal.title,
            body: t.itemDeleteModal.body,
            cancelLabel: t.itemDeleteModal.cancel,
            confirmLabel: t.itemDeleteModal.confirm,
            confirmingLabel: t.itemDeleteModal.deleting,
            onConfirm: async () => {
                const updatedDay = await deleteItineraryItem({
                    dayId: selectedDay.id,
                    itemId: targetId,
                });

                if (updatedDay) {
                    setDays((prev) =>
                        prev.map((day) =>
                            day.id === updatedDay.id ? updatedDay : day,
                        ),
                    );
                    if (updatedDay.items.length === 0) {
                        setSelectedItemId(null);
                    } else {
                        const nextIndex = Math.min(
                            selectedItemIndex,
                            updatedDay.items.length - 1,
                        );
                        const nextItem =
                            updatedDay.items[Math.max(0, nextIndex)];
                        setSelectedItemId(nextItem?.id ?? null);
                    }
                }
            },
        });
    };

    const openDeleteTripModal = () => {
        setConfirmPayload({
            title: t.tripDeleteModal.title,
            body: t.tripDeleteModal.body,
            cancelLabel: t.tripDeleteModal.cancel,
            confirmLabel: t.tripDeleteModal.confirm,
            confirmingLabel: t.tripDeleteModal.deleting,
            onConfirm: async () => {
                const result = await deleteItineraryTrip({ tripId });
                if (!result?.error) {
                    router.push('/sys-console/itinerary');
                }
            },
        });
    };

    const handleUpdateDayDate = async (nextDate: string) => {
        if (!selectedDay) return;
        const result = await updateItineraryDayDate({
            tripId,
            dayId: selectedDay.id,
            date: nextDate,
        });

        if (result?.days) {
            setDays(result.days);
            const nextIndex = result.days.findIndex(
                (day) => day.id === selectedDay.id,
            );
            setSelectedDayIndex(nextIndex >= 0 ? nextIndex : 0);
        }
    };

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === 's'
            ) {
                event.preventDefault();
                if (isItemsDirty) {
                    handleSaveItems();
                }
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleSaveItems, isItemsDirty]);

    const handleBack = useCallback(
        (guardAction: (action: () => void) => void) => {
            guardAction(() => {
                router.push('/sys-console/itinerary');
            });
        },
        [router],
    );

    useEffect(() => {
        if (!isItemsDirty) return;
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isItemsDirty]);

    const handleDayDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeId = Number(active.id);
        const overId = Number(over.id);
        if (Number.isNaN(activeId) || Number.isNaN(overId)) return;

        const selectedDayId = selectedDay?.id ?? null;
        const result = await reorderItineraryDays({
            tripId,
            dayId: activeId,
            targetDayId: overId,
        });

        if (result?.days) {
            setDays(result.days);
            if (selectedDayId) {
                const nextIndex = result.days.findIndex(
                    (day) => day.id === selectedDayId,
                );
                setSelectedDayIndex(nextIndex >= 0 ? nextIndex : 0);
            }
        }
    };

    const handleConfirm = async () => {
        if (!confirmPayload) return;
        setIsConfirming(true);
        try {
            await confirmPayload.onConfirm();
            setConfirmPayload(null);
        } finally {
            setIsConfirming(false);
        }
    };
    return (
        <UnsavedChangesGuard isDirty={isItemsDirty} labels={t.unsavedModal}>
            {({ guardAction }) => (
                <section className={styles.page}>
                    <ItineraryHeader
                        title={tripTitle || t.title}
                        backLabel={t.labels.back}
                        editLabel={t.labels.editTrip}
                        deleteLabel={t.labels.deleteTrip.replace(
                            '{name}',
                            tripTitle,
                        )}
                        errorText={tripSaveError}
                        onBack={() => handleBack(guardAction)}
                        onEdit={openEditTripModal}
                        onDelete={openDeleteTripModal}
                    />
                    <div className={styles.contentArea}>
                        {!hasDays ? (
                            <ItineraryEmptyState
                                title={t.labels.emptyTitle}
                                body={t.labels.emptyBody}
                                addLabel={t.labels.addDay}
                                onAdd={handleAddFirstDay}
                            />
                        ) : (
                            <div className={styles.desktopLayoutAdmin}>
                                <ItineraryDayColumn
                                    days={days}
                                    selectedDayIndex={selectedDayIndex}
                                    messages={t}
                                    onSelectDay={(index) =>
                                        guardAction(() =>
                                            setSelectedDayIndex(index),
                                        )
                                    }
                                    onDeleteDay={openDeleteDayModal}
                                    onAddDayBeforeFirst={
                                        handleAddDayBeforeFirst
                                    }
                                    onAddDayAfterLast={handleAddDayAfterLast}
                                    onReorder={handleDayDragEnd}
                                />
                                <ItineraryTimelineColumn
                                    selectedDay={selectedDay}
                                    selectedItemId={selectedItemId}
                                    items={items}
                                    messages={t}
                                    onAddFirstItem={handleAddFirstItem}
                                    onSelectItem={(id) =>
                                        guardAction(() => setSelectedItemId(id))
                                    }
                                    onDeleteItem={openDeleteItemModal}
                                    onInsertItem={handleInsertItem}
                                    onEditDay={openEditDayModal}
                                />
                                <div className={styles.detailColumn}>
                                    <FormProvider {...form}>
                                        <ItineraryItemEditor
                                            t={t}
                                            selectedItem={selectedItem}
                                            selectedDay={selectedDay}
                                            isDirty={isItemsDirty}
                                            isSaving={isSavingTrip}
                                            errorText={tripSaveError}
                                            onSave={handleSaveItems}
                                            onDelete={() =>
                                                openDeleteItemModal()
                                            }
                                            updateSelectedItem={
                                                updateSelectedItem
                                            }
                                        />
                                    </FormProvider>
                                </div>
                            </div>
                        )}
                    </div>
                    <EditDayDateModal
                        isOpen={isEditDayModalOpen}
                        date={
                            selectedDay
                                ? `${new Date(selectedDay.date).getFullYear()}-${String(
                                      new Date(selectedDay.date).getMonth() + 1,
                                  ).padStart(2, '0')}-${String(
                                      new Date(selectedDay.date).getDate(),
                                  ).padStart(2, '0')}`
                                : ''
                        }
                        labels={{
                            title: t.dayEditModal.title,
                            dateLabel: t.dayEditModal.dateLabel,
                            cancel: t.dayEditModal.cancel,
                            save: t.dayEditModal.save,
                        }}
                        requiredMessage={t.validation.required}
                        invalidMessage={t.validation.dateInvalid}
                        onClose={closeEditDayModal}
                        onSave={handleUpdateDayDate}
                    />
                    <EditTripModal
                        isOpen={isEditTripModalOpen}
                        title={tripTitle}
                        slug={tripSlug}
                        labels={{
                            title: t.tripModal.title,
                            nameLabel: t.tripModal.nameLabel,
                            slugLabel: t.tripModal.slugLabel,
                            cancel: t.tripModal.cancel,
                            save: t.tripModal.save,
                        }}
                        requiredMessage={t.validation.required}
                        onClose={closeEditTripModal}
                        onSave={handleTripMetaSave}
                    />
                    <ConfirmModal
                        isOpen={Boolean(confirmPayload)}
                        title={confirmPayload?.title ?? ''}
                        body={confirmPayload?.body ?? ''}
                        cancelLabel={confirmPayload?.cancelLabel ?? ''}
                        confirmLabel={confirmPayload?.confirmLabel ?? ''}
                        confirmingLabel={confirmPayload?.confirmingLabel}
                        isConfirming={isConfirming}
                        onCancel={closeConfirmModal}
                        onConfirm={handleConfirm}
                    />
                </section>
            )}
        </UnsavedChangesGuard>
    );
}
