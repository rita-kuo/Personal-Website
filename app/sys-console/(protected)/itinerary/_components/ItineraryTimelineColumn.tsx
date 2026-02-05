import styles from '../itinerary.module.css';
import ItineraryListItem from './ItineraryListItem';
import type { ItineraryAdminMessages } from '@/lib/i18n/types';

type ItineraryItem = {
    id: number;
    startTime: string;
    endTime: string | null;
    title: string;
};

type ItineraryDay = {
    id: number;
    date: string;
    items: ItineraryItem[];
};

type ItineraryMessages = ItineraryAdminMessages['itinerary'];

type Props = {
    selectedDay?: ItineraryDay;
    selectedItemId: number | null;
    items: ItineraryItem[];
    messages: ItineraryMessages;
    onAddFirstItem: () => void;
    onSelectItem: (id: number) => void;
    onDeleteItem: (id: number) => void;
    onInsertItem: (id: number) => void;
    onEditDay: () => void;
};

const formatTime = (value: string | null | undefined) => {
    if (!value) return '';
    const date = new Date(value);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

const formatItemDescription = (item: ItineraryItem) => {
    const start = formatTime(item.startTime);
    if (!item.endTime) return start;
    return `${start} - ${formatTime(item.endTime)}`;
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

export default function ItineraryTimelineColumn({
    selectedDay,
    selectedItemId,
    items,
    messages,
    onAddFirstItem,
    onSelectItem,
    onDeleteItem,
    onInsertItem,
    onEditDay,
}: Props) {
    return (
        <div className={styles.timelineColumn}>
            <div className={styles.timelineHeader}>
                <h2 className={styles.sectionTitle}>
                    {selectedDay
                        ? `${formatDayTitle(
                              selectedDay,
                              messages.labels.weekdays,
                          )} ${messages.labels.timeline}`
                        : messages.labels.timeline}
                </h2>
                <button
                    type='button'
                    className={styles.iconButton}
                    onClick={onEditDay}
                    aria-label={messages.dayEditModal.title}
                    disabled={!selectedDay}
                >
                    <i className='ri-pencil-line' aria-hidden='true' />
                </button>
            </div>
            <ol className={`${styles.timelineList} ${styles.compactList}`}>
                {items.length === 0 && (
                    <li className={styles.timelineItem}>
                        <button
                            type='button'
                            className={styles.addItemButton}
                            aria-label={messages.labels.addItem}
                            onClick={onAddFirstItem}
                        >
                            <i className='ri-add-line' aria-hidden='true' />
                        </button>
                    </li>
                )}
                {items.map((item) => (
                    <ItineraryListItem
                        key={item.id}
                        title={item.title || messages.labels.title}
                        description={formatItemDescription(item)}
                        isSelected={item.id === selectedItemId}
                        deleteLabel={messages.labels.deleteItem}
                        appendLabel={messages.labels.addItem}
                        onSelect={() => onSelectItem(item.id)}
                        onDelete={() => onDeleteItem(item.id)}
                        onAppend={() => onInsertItem(item.id)}
                    />
                ))}
            </ol>
        </div>
    );
}
