'use client';

import styles from '../game-editor.module.css';

type Level = {
    id: string;
    name: string;
    slug: string;
};

type Props = {
    level: Level | null;
    gameSlug: string;
    onEdit: () => void;
    onDelete: () => void;
    t: any;
    locale: string;
};

export default function LevelHeaderEditor({
    level,
    gameSlug,
    onEdit,
    onDelete,
    t,
    locale,
}: Props) {
    if (!level) {
        return <h2>{t.details}</h2>;
    }

    const handleCopyLink = () => {
        const url = `${window.location.origin}/${locale}/game/${gameSlug}/level/${level.slug}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        });
    };

    return (
        <div className={styles.levelHeaderEditor}>
            <div className={styles.editableHeader}>
                <div className={styles.editableText} onClick={onEdit}>
                    <h2>{level.name}</h2>
                    <i className='ri-pencil-line'></i>
                </div>
                <div
                    style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        gap: '0.5rem',
                    }}
                >
                    <button
                        className={styles.iconBtn}
                        onClick={handleCopyLink}
                        title='Copy Link'
                    >
                        <i className='ri-file-copy-line'></i>
                    </button>
                    <button
                        className={styles.iconBtn}
                        onClick={onDelete}
                        title={t.deleteLevel}
                    >
                        <i className='ri-delete-bin-line'></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
