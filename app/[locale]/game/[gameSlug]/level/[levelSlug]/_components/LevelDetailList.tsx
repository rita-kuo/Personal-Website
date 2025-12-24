'use client';

import { ActionType } from '@prisma/client';
import ImageDetail from './ImageDetail';
import IOTDetail from './IOTDetail';
import styles from '../level.module.css';

interface LevelDetail {
    id: number;
    name: string;
    actionType: ActionType;
    content: string;
}

interface LevelDetailListProps {
    details: LevelDetail[];
}

export default function LevelDetailList({ details }: LevelDetailListProps) {
    if (!details || details.length === 0) {
        return <div className={styles.container}>No details found.</div>;
    }

    return (
        <div className={styles.container}>
            {details.map((detail) => (
                <div key={detail.id}>
                    {detail.actionType === 'IMAGE' && (
                        <ImageDetail
                            content={detail.content}
                            name={detail.name}
                        />
                    )}
                    {detail.actionType === 'IOT' && (
                        <IOTDetail detailId={detail.id} name={detail.name} />
                    )}
                    {detail.actionType !== 'IMAGE' &&
                        detail.actionType !== 'IOT' && (
                            <div>Unknown type: {detail.actionType}</div>
                        )}
                </div>
            ))}
        </div>
    );
}
