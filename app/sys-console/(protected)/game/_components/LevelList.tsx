'use client';

import styles from '../game-editor.module.css';

type Level = {
    id: string;
    name: string;
    slug: string;
};

type Props = {
    levels: Level[];
    selectedLevelId: string | null;
    onSelect: (id: string) => void;
    onAdd: () => void;
    t: any;
};

export default function LevelList({
    levels,
    selectedLevelId,
    onSelect,
    onAdd,
    t,
}: Props) {
    return (
        <div className={styles.column}>
            <div className={styles.columnContent}>
                <div className={styles.list}>
                    {levels.map((level) => (
                        <div
                            key={level.id}
                            className={`${styles.listItem} ${
                                selectedLevelId === level.id
                                    ? styles.active
                                    : ''
                            }`}
                            onClick={() => onSelect(level.id)}
                        >
                            {level.name}
                        </div>
                    ))}
                    <button
                        className={`outline ${styles.addButton}`}
                        onClick={onAdd}
                    >
                        <i className='ri-add-line'></i>
                        {t.addLevel}
                    </button>
                </div>
            </div>
        </div>
    );
}
