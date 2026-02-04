'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { DragEndEvent } from '@dnd-kit/core';
import styles from '../itinerary.module.css';
import ItineraryEmptyState from './ItineraryEmptyState';
import ItineraryHeader from './ItineraryHeader';
import ItineraryItemEditor from './ItineraryItemEditor';
import ItineraryListItem from './ItineraryListItem';
import EditTripModal from './EditTripModal';
import ItineraryDayColumn from './ItineraryDayColumn';
import EditDayDateModal from './EditDayDateModal';
import ConfirmModal from '@/app/sys-console/_components/ConfirmModal';
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

type AdminMessages = {
    itinerary: {
        title: string;
        daySwitch: {
            prev: string;
            next: string;
            label: string;
            addDay: string;
        };
        labels: {
            timeline: string;
            dayList: string;
            dragDay: string;
            editor: string;
            timeStart: string;
            timeEnd: string;
            title: string;
            location: string;
            parking: string;
            contact: string;
            memo: string;
            saveTrip: string;
            savingTrip: string;
            addItem: string;
            deleteItem: string;
            editTrip: string;
            deleteTrip: string;
            emptySelection: string;
            emptyDay: string;
            emptyTitle: string;
            emptyBody: string;
            addDay: string;
            departureTitle: string;
            weekdays: string[];
        };
        tripModal: {
            title: string;
            nameLabel: string;
            slugLabel: string;
            cancel: string;
            save: string;
            saving: string;
        };
        tripDeleteModal: {
            title: string;
            body: string;
            cancel: string;
            confirm: string;
            deleting: string;
        };
        dayModal: {
            title: string;
            dateLabel: string;
            cancel: string;
            create: string;
            creating: string;
        };
        dayEditModal: {
            title: string;
            dateLabel: string;
            cancel: string;
            save: string;
        };
        itemDeleteModal: {
            title: string;
            body: string;
            cancel: string;
            confirm: string;
            deleting: string;
        };
        dayDeleteModal: {
            title: string;
            body: string;
            cancel: string;
            confirm: string;
            deleting: string;
        };
        validation: {
            required: string;
            invalidUrl: string;
            endBeforeStart: string;
            tooLong: string;
            dateDuplicate: string;
            dateInvalid: string;
            saveFailed: string;
            slugDuplicate: string;
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
    return day.items[0]?.id ?? null;
};

const formatItemDescription = (item: ItineraryItem) => {
    const start = formatTime(item.startTime);
    if (!item.endTime) return start;
    return `${start} - ${formatTime(item.endTime)}`;
};

const formatDateInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function ItineraryAdmin({
    messages,
    days: initialDays,
    tripId,
    tripTitle: initialTripTitle,
    tripSlug: initialTripSlug,
}: {
    messages: AdminMessages;
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
    const [isDeleteTripModalOpen, setIsDeleteTripModalOpen] = useState(false);
    const [isDeletingTrip, setIsDeletingTrip] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditDayModalOpen, setIsEditDayModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDayTargetId, setDeleteDayTargetId] = useState<number | null>(
        null,
    );
    const [deleteDayTargetIndex, setDeleteDayTargetIndex] = useState(0);
    const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);
    const [isDeletingItem, setIsDeletingItem] = useState(false);

    const hasDays = days.length > 0;
    const selectedDay = days[selectedDayIndex];
    const items = selectedDay?.items ?? [];
    const selectedItem = items.find((item) => item.id === selectedItemId);
    const selectedItemIndex = items.findIndex(
        (item) => item.id === selectedItemId,
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
        const result = await createItineraryDay({
            tripId,
            departureTitle: t.labels.departureTitle,
            date: formatDateInput(firstDate),
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

    const openDeleteModal = (dayId: number, dayIndex: number) => {
        setDeleteDayTargetId(dayId);
        setDeleteDayTargetIndex(dayIndex);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeleteDayTargetId(null);
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

    const openDeleteTripModal = () => {
        setIsDeleteTripModalOpen(true);
    };

    const closeDeleteTripModal = () => {
        setIsDeleteTripModalOpen(false);
    };

    const openDeleteItemModal = () => {
        if (!selectedItemId) return;
        setIsDeleteItemModalOpen(true);
    };

    const openDeleteItemModalWithId = (itemId: number) => {
        setSelectedItemId(itemId);
        setIsDeleteItemModalOpen(true);
    };

    const closeDeleteItemModal = () => {
        setIsDeleteItemModalOpen(false);
    };

    const handleDeleteDay = async () => {
        if (!deleteDayTargetId) return;
        setIsDeleting(true);
        const result = await deleteItineraryDay({
            tripId,
            dayId: deleteDayTargetId,
        });
        setIsDeleting(false);

        if (result?.days) {
            setDays(result.days);
            const nextIndex = result.days.length
                ? Math.min(deleteDayTargetIndex, result.days.length - 1)
                : 0;
            setSelectedDayIndex(nextIndex);
            closeDeleteModal();
        }
    };

    const handleDeleteItem = async () => {
        if (!selectedDay || !selectedItemId) return;
        setIsDeletingItem(true);
        const updatedDay = await deleteItineraryItem({
            dayId: selectedDay.id,
            itemId: selectedItemId,
        });
        setIsDeletingItem(false);

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
                const nextItem = updatedDay.items[Math.max(0, nextIndex)];
                setSelectedItemId(nextItem?.id ?? null);
            }
            closeDeleteItemModal();
        }
    };

    const handleDeleteTrip = async () => {
        setIsDeletingTrip(true);
        const result = await deleteItineraryTrip({ tripId });
        setIsDeletingTrip(false);
        if (!result?.error) {
            router.push('/sys-console/itinerary');
        }
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
    return (
        <section className={styles.page}>
            <ItineraryHeader
                title={tripTitle || t.title}
                editLabel={t.labels.editTrip}
                deleteLabel={t.labels.deleteTrip}
                errorText={tripSaveError}
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
                            onSelectDay={(index) => setSelectedDayIndex(index)}
                            onDeleteDay={openDeleteModal}
                            onAddDayBeforeFirst={handleAddDayBeforeFirst}
                            onAddDayAfterLast={handleAddDayAfterLast}
                            onReorder={handleDayDragEnd}
                        />
                        <div className={styles.timelineColumn}>
                            <div className={styles.timelineHeader}>
                                <h2 className={styles.sectionTitle}>
                                    {selectedDay
                                        ? `${formatDayTitle(selectedDay, weekdayLabels)} ${t.labels.timeline}`
                                        : t.labels.timeline}
                                </h2>
                                <button
                                    type='button'
                                    className={styles.iconButton}
                                    onClick={openEditDayModal}
                                    aria-label={t.dayEditModal.title}
                                    disabled={!selectedDay}
                                >
                                    <i
                                        className='ri-pencil-line'
                                        aria-hidden='true'
                                    />
                                </button>
                            </div>
                            <ol
                                className={`${styles.timelineList} ${styles.compactList}`}
                            >
                                {items.length === 0 && (
                                    <li className={styles.timelineItem}>
                                        <button
                                            type='button'
                                            className={styles.addItemButton}
                                            aria-label={t.labels.addItem}
                                            onClick={handleAddFirstItem}
                                        >
                                            <i
                                                className='ri-add-line'
                                                aria-hidden='true'
                                            />
                                        </button>
                                    </li>
                                )}
                                {items.map((item) => (
                                    <ItineraryListItem
                                        key={item.id}
                                        title={item.title || t.labels.title}
                                        description={formatItemDescription(
                                            item,
                                        )}
                                        isSelected={item.id === selectedItemId}
                                        deleteLabel={t.labels.deleteItem}
                                        appendLabel={t.labels.addItem}
                                        onSelect={() =>
                                            setSelectedItemId(item.id)
                                        }
                                        onDelete={() =>
                                            openDeleteItemModalWithId(item.id)
                                        }
                                        onAppend={() =>
                                            handleInsertItem(item.id)
                                        }
                                        containerClassName={styles.timelineItem}
                                        rowClassName={styles.listRow}
                                        selectClassName={styles.compactButton}
                                        titleClassName={styles.compactTitle}
                                        descriptionClassName={
                                            styles.compactTime
                                        }
                                        appendClassName={styles.addItemButton}
                                    />
                                ))}
                            </ol>
                        </div>
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
                                    onDelete={openDeleteItemModal}
                                    updateSelectedItem={updateSelectedItem}
                                />
                            </FormProvider>
                        </div>
                    </div>
                )}
            </div>
            <ConfirmModal
                isOpen={isDeleteItemModalOpen}
                title={t.itemDeleteModal.title}
                body={t.itemDeleteModal.body}
                cancelLabel={t.itemDeleteModal.cancel}
                confirmLabel={t.itemDeleteModal.confirm}
                confirmingLabel={t.itemDeleteModal.deleting}
                isConfirming={isDeletingItem}
                onCancel={closeDeleteItemModal}
                onConfirm={handleDeleteItem}
            />
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title={t.dayDeleteModal.title}
                body={t.dayDeleteModal.body}
                cancelLabel={t.dayDeleteModal.cancel}
                confirmLabel={t.dayDeleteModal.confirm}
                confirmingLabel={t.dayDeleteModal.deleting}
                isConfirming={isDeleting}
                onCancel={closeDeleteModal}
                onConfirm={handleDeleteDay}
            />
            <EditDayDateModal
                isOpen={isEditDayModalOpen}
                date={
                    selectedDay
                        ? formatDateInput(new Date(selectedDay.date))
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
                isOpen={isDeleteTripModalOpen}
                title={t.tripDeleteModal.title}
                body={t.tripDeleteModal.body}
                cancelLabel={t.tripDeleteModal.cancel}
                confirmLabel={t.tripDeleteModal.confirm}
                confirmingLabel={t.tripDeleteModal.deleting}
                isConfirming={isDeletingTrip}
                onCancel={closeDeleteTripModal}
                onConfirm={handleDeleteTrip}
            />
        </section>
    );
}
