import { useEffect, useState } from 'react';
import modalStyles from '../itinerary-modal.module.css';

type EditTripModalProps = {
    isOpen: boolean;
    title: string;
    slug: string;
    labels: {
        title: string;
        nameLabel: string;
        slugLabel: string;
        cancel: string;
        save: string;
    };
    requiredMessage: string;
    onClose: () => void;
    onSave: (nextTitle: string, nextSlug: string) => void;
};

export default function EditTripModal({
    isOpen,
    title,
    slug,
    labels,
    requiredMessage,
    onClose,
    onSave,
}: EditTripModalProps) {
    const [editTitle, setEditTitle] = useState(title);
    const [editSlug, setEditSlug] = useState(slug);
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(isOpen);
    const [isClosing, setIsClosing] = useState(false);
    const [isOpening, setIsOpening] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setEditTitle(title);
        setEditSlug(slug);
        setError('');
    }, [isOpen, slug, title]);

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

    const handleSave = () => {
        if (!editTitle.trim() || !editSlug.trim()) {
            setError(requiredMessage);
            return;
        }
        onSave(editTitle.trim(), editSlug.trim());
        onClose();
    };

    return (
        <div
            className={`${modalStyles.backdrop} ${
                isClosing || !isOpening
                    ? modalStyles.backdropClosed
                    : modalStyles.backdropOpen
            }`}
        >
            <div
                className={`${modalStyles.modal} ${
                    isClosing || !isOpening
                        ? modalStyles.modalClosed
                        : modalStyles.modalOpen
                }`}
            >
                <header className={modalStyles.header}>
                    <h2 className={modalStyles.title}>{labels.title}</h2>
                    <button
                        type='button'
                        className={modalStyles.closeButton}
                        onClick={onClose}
                        aria-label={labels.cancel}
                    >
                        <i className='ri-close-line' aria-hidden='true' />
                    </button>
                </header>
                <div className={modalStyles.form}>
                    <label className={modalStyles.formLabel}>
                        {labels.nameLabel}
                        <input
                            type='text'
                            className={modalStyles.input}
                            value={editTitle}
                            onChange={(event) =>
                                setEditTitle(event.target.value)
                            }
                        />
                    </label>
                    <label className={modalStyles.formLabel}>
                        {labels.slugLabel}
                        <input
                            type='text'
                            className={modalStyles.input}
                            value={editSlug}
                            onChange={(event) =>
                                setEditSlug(event.target.value)
                            }
                        />
                    </label>
                    {error && (
                        <span className={modalStyles.errorText}>{error}</span>
                    )}
                    <div className={modalStyles.actions}>
                        <button
                            type='button'
                            className={modalStyles.secondaryButton}
                            onClick={onClose}
                        >
                            {labels.cancel}
                        </button>
                        <button
                            type='button'
                            className={modalStyles.primaryButton}
                            onClick={handleSave}
                        >
                            {labels.save}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
