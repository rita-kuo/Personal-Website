'use client';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import styles from '../itinerary.module.css';
import SortableDayItem from './SortableDayItem';

type ItineraryDay = {
    id: number;
    date: string;
};

type ItineraryMessages = {
    daySwitch: {
        addDay: string;
    };
    dayDeleteModal: {
        confirm: string;
    };
    labels: {
        dayList: string;
        dragDay: string;
        weekdays: string[];
    };
};

type Props = {
    days: ItineraryDay[];
    selectedDayIndex: number;
    messages: ItineraryMessages;
    onSelectDay: (index: number) => void;
    onDeleteDay: (dayId: number, index: number) => void;
    onAddDayBeforeFirst: () => void;
    onAddDayAfterLast: () => void;
    onReorder: (event: DragEndEvent) => void;
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

export default function ItineraryDayColumn({
    days,
    selectedDayIndex,
    messages,
    onSelectDay,
    onDeleteDay,
    onAddDayBeforeFirst,
    onAddDayAfterLast,
    onReorder,
}: Props) {
    const hasDays = days.length > 0;
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    return (
        <div className={styles.dayColumn}>
            <div className={styles.dayListHeader}>
                <h2 className={styles.sectionTitle}>
                    {messages.labels.dayList}
                </h2>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onReorder}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext
                    items={days.map((day) => day.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <ol className={styles.dayList}>
                        <li className={styles.dayItem}>
                            <button
                                type='button'
                                className={styles.addDayButton}
                                onClick={onAddDayBeforeFirst}
                                aria-label={messages.daySwitch.addDay}
                                disabled={!hasDays}
                            >
                                <i className='ri-add-line' aria-hidden='true' />
                            </button>
                        </li>
                        {days.map((day, index) => (
                            <SortableDayItem
                                key={day.id}
                                id={day.id}
                                title={`${index + 1}. ${formatDayTitle(
                                    day,
                                    messages.labels.weekdays,
                                )}`}
                                isSelected={index === selectedDayIndex}
                                deleteLabel={messages.dayDeleteModal.confirm}
                                dragLabel={messages.labels.dragDay}
                                onSelect={() => onSelectDay(index)}
                                onDelete={() => onDeleteDay(day.id, index)}
                            />
                        ))}
                        <li className={styles.dayItem}>
                            <button
                                type='button'
                                className={styles.addDayButton}
                                onClick={onAddDayAfterLast}
                                aria-label={messages.daySwitch.addDay}
                                disabled={!hasDays}
                            >
                                <i className='ri-add-line' aria-hidden='true' />
                            </button>
                        </li>
                    </ol>
                </SortableContext>
            </DndContext>
        </div>
    );
}
