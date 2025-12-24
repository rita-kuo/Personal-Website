'use client';

import styles from '../game-editor.module.css';

type LevelDetail = {
    id: string;
    name: string;
    content: string;
    actionType: string;
};

type Props = {
    detail: LevelDetail | null;
    onUpdate: (id: string, field: string, value: any) => void;
    onDelete: () => void;
    t: any;
};

export default function DetailEditor({ detail, onUpdate, onDelete, t }: Props) {
    if (!detail) {
        return (
            <div className={styles.column}>
                <div className={styles.columnContent}></div>
            </div>
        );
    }

    return (
        <div className={styles.column}>
            <div className={styles.columnContent}>
                <div className={styles.editorContainer}>
                    <div className={styles.editorField}>
                        <label>{t.name}</label>
                        <input
                            type='text'
                            value={detail.name || ''}
                            onChange={(e) =>
                                onUpdate(detail.id, 'name', e.target.value)
                            }
                            placeholder={t.placeholders.name}
                        />
                    </div>
                    <div className={styles.editorField}>
                        <label>{t.actionType}</label>
                        <select
                            value={detail.actionType}
                            onChange={(e) =>
                                onUpdate(
                                    detail.id,
                                    'actionType',
                                    e.target.value
                                )
                            }
                        >
                            <option value='NONE'>NONE</option>
                            <option value='IMAGE'>IMAGE</option>
                            <option value='IOT'>IOT</option>
                        </select>
                    </div>
                    <div className={styles.editorField} style={{ flex: 1 }}>
                        <label>{t.content}</label>
                        <textarea
                            value={detail.content}
                            onChange={(e) =>
                                onUpdate(detail.id, 'content', e.target.value)
                            }
                            placeholder={t.placeholders.content}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
