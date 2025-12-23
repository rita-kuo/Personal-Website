'use client';

import { useState, useEffect } from 'react';
import styles from '../game-editor.module.css';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string, slug: string) => void;
    initialName?: string;
    initialSlug?: string;
    title: string;
    confirmLabel?: string;
    t: any;
};

export default function LevelModal({
    isOpen,
    onClose,
    onConfirm,
    initialName = '',
    initialSlug = '',
    title,
    confirmLabel,
    t,
}: Props) {
    const [name, setName] = useState(initialName);
    const [slug, setSlug] = useState(initialSlug);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setSlug(initialSlug);
        }
    }, [isOpen, initialName, initialSlug]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && slug) {
            onConfirm(name, slug);
            onClose();
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <header className={styles.modalHeader}>
                    <h2>{title}</h2>
                </header>
                <form onSubmit={handleSubmit}>
                    <label>
                        {t.name}
                        <input
                            type='text'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.placeholders.name}
                            required
                        />
                    </label>
                    <label>
                        {t.slug}
                        <input
                            type='text'
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder={t.placeholders.slug}
                            required
                        />
                    </label>
                    <div className={styles.modalActions}>
                        <button
                            type='button'
                            className='secondary outline'
                            onClick={onClose}
                        >
                            {t.modal.cancel}
                        </button>
                        <button type='submit'>{confirmLabel}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
