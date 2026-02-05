import styles from '../itinerary.module.css';

type ItineraryListItemProps = {
    title: string;
    description?: string;
    isSelected?: boolean;
    deleteLabel: string;
    appendLabel: string;
    onSelect: () => void;
    onDelete: () => void;
    onAppend: () => void;
};

export default function ItineraryListItem({
    title,
    description,
    isSelected,
    deleteLabel,
    appendLabel,
    onSelect,
    onDelete,
    onAppend,
}: ItineraryListItemProps) {
    return (
        <li className={styles.timelineItem}>
            <div
                className={`${styles.listRow} ${
                    isSelected ? styles.isSelected : ''
                }`}
            >
                <button
                    type='button'
                    className={styles.compactButton}
                    onClick={onSelect}
                >
                    <span className={styles.compactTitle}>{title}</span>
                    {description && (
                        <span className={styles.compactTime}>
                            {description}
                        </span>
                    )}
                </button>
                <button
                    type='button'
                    className={`${styles.iconButton} ${styles.deleteIconButton}`}
                    onClick={onDelete}
                    aria-label={deleteLabel}
                >
                    <i className='ri-close-line' aria-hidden='true' />
                </button>
            </div>
            <button
                type='button'
                className={styles.addItemButton}
                onClick={onAppend}
                aria-label={appendLabel}
            >
                <i className='ri-add-line' aria-hidden='true' />
            </button>
        </li>
    );
}
