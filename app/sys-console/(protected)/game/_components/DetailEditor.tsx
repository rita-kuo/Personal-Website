'use client';

import { useFormContext } from 'react-hook-form';
import styles from '../game-editor.module.css';

type Props = {
    levelIndex: number;
    detailIndex: number;
    t: any;
};

export default function DetailEditor({ levelIndex, detailIndex, t }: Props) {
    const { register, getFieldState, formState } = useFormContext();

    if (levelIndex === -1 || detailIndex === -1) {
        return (
            <div className={styles.column}>
                <div className={styles.columnContent}></div>
            </div>
        );
    }

    // Helper to get error message safely
    const getError = (field: string) => {
        const { error } = getFieldState(
            `levels.${levelIndex}.details.${detailIndex}.${field}`,
            formState
        );
        return error?.message;
    };

    return (
        <div className={styles.column}>
            <div className={styles.columnContent}>
                <div className={styles.editorContainer}>
                    <div className={styles.editorField}>
                        <label>{t.name}</label>
                        <input
                            type='text'
                            {...register(
                                `levels.${levelIndex}.details.${detailIndex}.name`
                            )}
                            placeholder={t.placeholders.name}
                        />
                        {getError('name') && (
                            <span
                                style={{
                                    color: 'var(--pico-del-color)',
                                    fontSize: '0.8em',
                                }}
                            >
                                {getError('name')}
                            </span>
                        )}
                    </div>
                    <div className={styles.editorField}>
                        <label>{t.actionType}</label>
                        <select
                            {...register(
                                `levels.${levelIndex}.details.${detailIndex}.actionType`
                            )}
                        >
                            <option value='NONE'>NONE</option>
                            <option value='IMAGE'>IMAGE</option>
                            <option value='IOT'>IOT</option>
                        </select>
                    </div>
                    <div className={styles.editorField} style={{ flex: 1 }}>
                        <label>{t.content}</label>
                        <textarea
                            {...register(
                                `levels.${levelIndex}.details.${detailIndex}.content`
                            )}
                            placeholder={t.placeholders.content}
                        />
                        {getError('content') && (
                            <span
                                style={{
                                    color: 'var(--pico-del-color)',
                                    fontSize: '0.8em',
                                }}
                            >
                                {getError('content')}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
