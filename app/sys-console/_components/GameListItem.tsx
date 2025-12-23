import Link from 'next/link';
import styles from '../(protected)/games/games.module.css';
import 'animate.css';

type Props = {
    id: number;
    name: string;
    updatedAt: string;
    updatedAtLabel: string;
};

export default function GameListItem({
    id,
    name,
    updatedAt,
    updatedAtLabel,
}: Props) {
    return (
        <Link
            href={`/sys-console/game/${id}`}
            className={`${styles.item} animate__animated animate__fadeIn`}
        >
            <div className={styles.itemContent}>
                <h3 className={styles.itemName}>{name}</h3>
                <span className={styles.itemMeta}>
                    {updatedAtLabel}: {updatedAt}
                </span>
            </div>
            <div className={styles.arrow}>
                <i
                    className='ri-arrow-right-s-line'
                    style={{ fontSize: '1.5rem' }}
                ></i>
            </div>
        </Link>
    );
}
