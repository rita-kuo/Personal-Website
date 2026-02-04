import styles from '../itinerary.module.css';

type ItineraryEmptyStateProps = {
    title: string;
    body: string;
    addLabel: string;
    onAdd: () => void;
};

export default function ItineraryEmptyState({
    title,
    body,
    addLabel,
    onAdd,
}: ItineraryEmptyStateProps) {
    return (
        <article className={styles.emptyState}>
            <div className={styles.emptyContent}>
                <h2 className={styles.emptyTitle}>{title}</h2>
                <p className={styles.emptyText}>{body}</p>
            </div>
            <button
                type='button'
                className={styles.primaryButton}
                onClick={onAdd}
            >
                <i className='ri-add-line' aria-hidden='true' />
                {addLabel}
            </button>
        </article>
    );
}
