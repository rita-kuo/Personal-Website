'use client';

import { useState } from 'react';
import styles from '../game-editor.module.css';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string, slug: string) => void;
    t: any;
};

export default function AddLevelModal({
    isOpen,
    onClose,
    onConfirm,
    t,
}: Props) {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && slug) {
            onConfirm(name, slug);
            setName('');
            setSlug('');
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <header className={styles.modalHeader}>
                    <h2>{t.modal.addLevelTitle}</h2>
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
                        <button type='submit'>{t.modal.confirm}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
