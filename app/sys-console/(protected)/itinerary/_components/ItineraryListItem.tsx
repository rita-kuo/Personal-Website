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
    containerClassName: string;
    rowClassName: string;
    selectClassName: string;
    titleClassName: string;
    descriptionClassName?: string;
    appendClassName: string;
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
    containerClassName,
    rowClassName,
    selectClassName,
    titleClassName,
    descriptionClassName,
    appendClassName,
}: ItineraryListItemProps) {
    return (
        <li className={containerClassName}>
            <div className={rowClassName}>
                <button
                    type='button'
                    className={`${selectClassName} ${
                        isSelected ? styles.isSelected : ''
                    }`}
                    onClick={onSelect}
                >
                    <span className={titleClassName}>{title}</span>
                    {description && descriptionClassName && (
                        <span className={descriptionClassName}>
                            {description}
                        </span>
                    )}
                </button>
                <button
                    type='button'
                    className={styles.iconButton}
                    onClick={onDelete}
                    aria-label={deleteLabel}
                >
                    <i className='ri-close-line' aria-hidden='true' />
                </button>
            </div>
            <button
                type='button'
                className={appendClassName}
                onClick={onAppend}
                aria-label={appendLabel}
            >
                <i className='ri-add-line' aria-hidden='true' />
            </button>
        </li>
    );
}
