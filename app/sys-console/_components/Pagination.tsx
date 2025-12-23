import Link from 'next/link';
import styles from '../(protected)/games/games.module.css';

type Props = {
    page: number;
    totalPages: number;
    baseUrl: string;
    prevLabel: string;
    nextLabel: string;
};

export default function Pagination({
    page,
    totalPages,
    baseUrl,
    prevLabel,
    nextLabel,
}: Props) {
    const hasPrev = page > 1;
    const hasNext = page < totalPages;

    return (
        <div className={styles.pagination}>
            <Link
                href={hasPrev ? `${baseUrl}?page=${page - 1}` : '#'}
                className={styles.paginationButton}
                aria-disabled={!hasPrev}
            >
                {prevLabel}
            </Link>
            <Link
                href={hasNext ? `${baseUrl}?page=${page + 1}` : '#'}
                className={styles.paginationButton}
                aria-disabled={!hasNext}
            >
                {nextLabel}
            </Link>
        </div>
    );
}
