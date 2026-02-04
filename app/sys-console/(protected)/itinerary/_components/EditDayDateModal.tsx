import { useEffect, useState } from 'react';
import modalStyles from '../itinerary-modal.module.css';

type EditDayDateModalProps = {
    isOpen: boolean;
    date: string;
    labels: {
        title: string;
        dateLabel: string;
        cancel: string;
        save: string;
    };
    requiredMessage: string;
    invalidMessage: string;
    onClose: () => void;
    onSave: (nextDate: string) => void;
};

const isValidDateValue = (value: string) => {
    if (!value) return false;
    const parsed = new Date(`${value}T00:00:00`);
    return !Number.isNaN(parsed.getTime());
};

export default function EditDayDateModal({
    isOpen,
    date,
    labels,
    requiredMessage,
    invalidMessage,
    onClose,
    onSave,
}: EditDayDateModalProps) {
    const [editDate, setEditDate] = useState(date);
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(isOpen);
    const [isClosing, setIsClosing] = useState(false);
    const [isOpening, setIsOpening] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setEditDate(date);
        setError('');
    }, [date, isOpen]);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setIsClosing(false);
            setIsOpening(false);
            const frame = window.requestAnimationFrame(() => {
                setIsOpening(true);
            });
            return () => window.cancelAnimationFrame(frame);
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
        if (!editDate.trim()) {
            setError(requiredMessage);
            return;
        }
        if (!isValidDateValue(editDate)) {
            setError(invalidMessage);
            return;
        }
        onSave(editDate);
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
                        {labels.dateLabel}
                        <input
                            type='date'
                            className={modalStyles.input}
                            value={editDate}
                            onChange={(event) =>
                                setEditDate(event.target.value)
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
