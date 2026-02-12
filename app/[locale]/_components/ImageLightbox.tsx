'use client';

import { useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import styles from './image-lightbox.module.css';

type ImageLightboxProps = {
    src: string | null;
    onClose: () => void;
};

export default function ImageLightbox({ src, onClose }: ImageLightboxProps) {
    useEffect(() => {
        if (!src) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [src, onClose]);

    if (!src) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <button
                type='button'
                className={styles.closeButton}
                onClick={onClose}
                aria-label='Close'
            >
                <i className='ri-close-line' aria-hidden='true' />
            </button>
            <div
                className={styles.imageWrapper}
                onClick={(e) => {
                    if ((e.target as HTMLElement).tagName !== 'IMG') {
                        onClose();
                    }
                }}
            >
                <TransformWrapper
                    minScale={1}
                    maxScale={10}
                    initialScale={1}
                    centerOnInit
                    limitToBounds={false}
                >
                    <TransformComponent
                        wrapperClass={styles.transformWrapper}
                    >
                        <img src={src} alt='' draggable={false} />
                    </TransformComponent>
                </TransformWrapper>
            </div>
        </div>
    );
}
