import styles from '../itinerary.module.css';

type ItineraryHeaderProps = {
    title: string;
    editLabel: string;
    saveLabel: string;
    savingLabel: string;
    deleteLabel: string;
    isSaving: boolean;
    isDirty: boolean;
    errorText?: string;
    onEdit: () => void;
    onSave: () => void;
    onDelete: () => void;
};

export default function ItineraryHeader({
    title,
    editLabel,
    saveLabel,
    savingLabel,
    deleteLabel,
    isSaving,
    isDirty,
    errorText,
    onEdit,
    onSave,
    onDelete,
}: ItineraryHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.headerRow}>
                <div className={styles.titleGroup}>
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
                        className={styles.primaryButton}
                        onClick={onSave}
                        disabled={!isDirty || isSaving}
                    >
                        {isSaving ? savingLabel : saveLabel}
                    </button>
                    <button
                        type='button'
                        className={styles.secondaryButton}
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
