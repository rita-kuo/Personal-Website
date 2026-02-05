import styles from '../itinerary.module.css';

type ItineraryHeaderProps = {
    title: string;
    backLabel: string;
    editLabel: string;
    deleteLabel: string;
    errorText?: string;
    onBack: () => void;
    onEdit: () => void;
    onDelete: () => void;
};

export default function ItineraryHeader({
    title,
    backLabel,
    editLabel,
    deleteLabel,
    errorText,
    onBack,
    onEdit,
    onDelete,
}: ItineraryHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.headerRow}>
                <div className={styles.titleGroup}>
                    <button
                        type='button'
                        className={styles.iconButton}
                        onClick={onBack}
                        aria-label={backLabel}
                    >
                        <i className='ri-arrow-left-line' aria-hidden='true' />
                    </button>
                    <h1 className={styles.pageTitle}>{title}</h1>
                    <button
                        type='button'
                        className={styles.iconButton}
                        onClick={onEdit}
                        aria-label={editLabel}
                    >
                        <i className='ri-pencil-line' aria-hidden='true' />
                    </button>
                </div>
                <div className={styles.headerActions}>
                    <button
                        type='button'
                        className={styles.deleteButton}
                        onClick={onDelete}
                    >
                        {deleteLabel}
                    </button>
                </div>
            </div>
            {errorText && <p className={styles.errorText}>{errorText}</p>}
        </header>
    );
}
