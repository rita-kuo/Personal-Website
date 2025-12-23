'use client';

import styles from '../game-editor.module.css';

type LevelDetail = {
    id: string;
    name: string;
    content: string;
    actionType: string;
    meta?: any;
};

type Level = {
    id: string;
    name: string;
    slug: string;
    details: LevelDetail[];
};

type Props = {
    level: Level | null;
    selectedDetailId: string | null;
    onSelect: (id: string) => void;
    onAdd: () => void;
    t: any;
};

export default function LevelDetailList({
    level,
    selectedDetailId,
    onSelect,
    onAdd,
    t,
}: Props) {
    if (!level) {
        return (
            <div className={styles.column}>
                <div className={styles.columnContent}></div>
            </div>
        );
    }

    return (
        <div className={styles.column}>
            <div className={styles.columnContent}>
                <div className={styles.list}>
                    {level.details.map((detail, index) => (
                        <div
                            key={detail.id}
                            className={`${styles.listItem} ${
                                selectedDetailId === detail.id
                                    ? styles.active
                                    : ''
                            }`}
                            onClick={() => onSelect(detail.id)}
                        >
                            {detail.name ||
                                (detail.content
                                    ? detail.content.length > 20
                                        ? detail.content.substring(0, 20) +
                                          '...'
                                        : detail.content
                                    : `${t.details} ${index + 1}`)}
                        </div>
                    ))}
                    <button
                        className={`outline ${styles.addButton}`}
                        onClick={onAdd}
                    >
                        <i className='ri-add-line'></i>
                        {t.addDetail}
                    </button>
                </div>
            </div>
        </div>
    );
}
