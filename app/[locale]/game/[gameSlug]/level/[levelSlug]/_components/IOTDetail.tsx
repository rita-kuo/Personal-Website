'use client';

import { useState, useRef } from 'react';
import styles from '../level.module.css';
import { triggerIotAction } from '../actions';
import 'animate.css';
import { useTranslations } from 'next-intl';

interface IOTDetailProps {
    detailId: number;
    name: string;
}

export default function IOTDetail({ detailId, name }: IOTDetailProps) {
    const t = useTranslations('gamePlay');
    const [status, setStatus] = useState<
        'idle' | 'pressing' | 'success' | 'cooldown'
    >('idle');
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startPress = () => {
        if (status === 'cooldown' || status === 'success') return;
        setStatus('pressing');
        timerRef.current = setTimeout(async () => {
            setStatus('success');
            await triggerIotAction(detailId);
        }, 2000); // 2 seconds long press
    };

    const endPress = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (status === 'success') {
            setStatus('cooldown');
            setTimeout(() => {
                setStatus('idle');
            }, 3000);
        } else if (status === 'pressing') {
            setStatus('idle');
        }
    };

    return (
        <article className={styles.iotContainer}>
            <div
                className={`${styles.fingerprintSensor} ${styles[status]}`}
                onMouseDown={startPress}
                onMouseUp={endPress}
                onMouseLeave={endPress}
                onTouchStart={startPress}
                onTouchEnd={endPress}
                role='button'
                aria-label={t('activate', { name })}
                tabIndex={0}
            >
                <svg
                    className={styles.progressRing}
                    width='80'
                    height='80'
                    viewBox='0 0 80 80'
                >
                    <circle
                        className={styles.progressRingCircle}
                        stroke='currentColor'
                        strokeWidth='4'
                        fill='transparent'
                        r='38'
                        cx='40'
                        cy='40'
                    />
                </svg>
                <i className='ri-fingerprint-line'></i>
            </div>
            <div
                className={`${styles.accessGranted} ${
                    status === 'success' || status === 'cooldown'
                        ? styles.visible
                        : ''
                }`}
            >
                {t('accessGranted')}
            </div>
        </article>
    );
}
