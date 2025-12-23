'use client';

import styles from '../game-editor.module.css';

type Level = {
    id: string;
    name: string;
    slug: string;
};

type Props = {
    level: Level | null;
    onEdit: () => void;
    t: any;
};

export default function LevelHeaderEditor({ level, onEdit, t }: Props) {
    if (!level) {
        return <h2>{t.details}</h2>;
    }

    return (
        <div className={styles.levelHeaderEditor}>
            <div className={styles.editableHeader}>
                <div className={styles.editableText} onClick={onEdit}>
                    <h2>{level.name}</h2>
                    <i className='ri-pencil-line'></i>
                </div>
            </div>
        </div>
    );
}
