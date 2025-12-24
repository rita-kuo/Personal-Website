'use client';

import { useState } from 'react';
import styles from '../level.module.css';
import 'animate.css';
import { useTranslations } from 'next-intl';

interface ImageDetailProps {
    content: string; // URL of the image
    name: string;
}

export default function ImageDetail({ content, name }: ImageDetailProps) {
    const t = useTranslations('gamePlay');
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = () => {
        setIsOpen(true);
    };

    return (
        <div className={styles.imageDetailContainer}>
            {!isOpen && (
                <div
                    className={`${styles.envelopeContainer} animate__animated animate__fadeIn`}
                >
                    <div className={styles.envelope}>
                        <div
                            className={styles.outerWax}
                            role='button'
                            onClick={handleOpen}
                            aria-label={t('openEnvelope')}
                        >
                            <div className={styles.innerWax} />
                            <i className='ri-bear-smile-line'></i>
                        </div>
                    </div>
                </div>
            )}

            <div
                className={`${styles.imageContent} ${
                    isOpen ? styles.visible : ''
                }`}
            >
                {isOpen && (
                    <img
                        src={content}
                        alt={name}
                        className='animate__animated animate__slideInUp'
                    />
                )}
            </div>
        </div>
    );
}
