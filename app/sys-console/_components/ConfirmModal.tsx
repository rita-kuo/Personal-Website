import { useEffect, useState } from 'react';
import styles from './confirm-modal.module.css';

type ConfirmModalProps = {
    isOpen: boolean;
    title: string;
    body: string;
    cancelLabel: string;
    confirmLabel: string;
    confirmingLabel?: string;
    isConfirming?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function ConfirmModal({
    isOpen,
    title,
    body,
    cancelLabel,
    confirmLabel,
    confirmingLabel,
    isConfirming,
    onCancel,
    onConfirm,
}: ConfirmModalProps) {
    const [isVisible, setIsVisible] = useState(isOpen);
    const [isClosing, setIsClosing] = useState(false);
    const [isOpening, setIsOpening] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setIsClosing(false);
            setIsOpening(false);
            const frame = window.requestAnimationFrame(() => {
                setIsOpening(true);
            });
            return () => window.cancelAnimationFrame(frame);
            return;
        }

        if (isVisible) {
            setIsClosing(true);
            setIsOpening(false);
            const timer = window.setTimeout(() => {
                setIsVisible(false);
                setIsClosing(false);
            }, 220);
            return () => window.clearTimeout(timer);
        }
    }, [isOpen, isVisible]);

    if (!isVisible) return null;

    return (
        <div
            className={`${styles.backdrop} ${
                isClosing || !isOpening
                    ? styles.backdropClosed
                    : styles.backdropOpen
            }`}
        >
            <div
                className={`${styles.modal} ${
                    isClosing || !isOpening
                        ? styles.modalClosed
                        : styles.modalOpen
                }`}
            >
                <header className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button
                        type='button'
                        className={styles.closeButton}
                        onClick={onCancel}
                        aria-label={cancelLabel}
                    >
                        <i className='ri-close-line' aria-hidden='true' />
                    </button>
                </header>
                <div className={styles.body}>
                    <p className={styles.text}>{body}</p>
                </div>
                <footer className={styles.footer}>
                    <button
                        type='button'
                        className={styles.secondaryButton}
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type='button'
                        className={styles.primaryButton}
                        onClick={onConfirm}
                        disabled={isConfirming}
                    >
                        {isConfirming && confirmingLabel
                            ? confirmingLabel
                            : confirmLabel}
                    </button>
                </footer>
            </div>
        </div>
    );
}
