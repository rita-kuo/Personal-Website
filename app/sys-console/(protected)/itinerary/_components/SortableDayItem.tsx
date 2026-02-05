'use client';

import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from '../itinerary.module.css';

type Props = {
    id: number;
    title: string;
    isSelected: boolean;
    deleteLabel: string;
    dragLabel: string;
    onSelect: () => void;
    onDelete: () => void;
};

export default function SortableDayItem({
    id,
    title,
    isSelected,
    deleteLabel,
    dragLabel,
    onSelect,
    onDelete,
}: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });
    const nodeRef = useRef<HTMLLIElement | null>(null);

    const setRefs = useCallback(
        (node: HTMLLIElement | null) => {
            nodeRef.current = node;
            setNodeRef(node);
        },
        [setNodeRef],
    );

    const styleValue = useMemo(
        () => ({
            transform: CSS.Transform.toString(transform) ?? '',
            transition: transition ?? '',
        }),
        [transform, transition],
    );

    useEffect(() => {
        if (!nodeRef.current) return;
        nodeRef.current.style.transform = styleValue.transform;
        nodeRef.current.style.transition = styleValue.transition;
    }, [styleValue]);

    return (
        <li
            ref={setRefs}
            className={`${styles.daySortableItem} ${
                isDragging ? styles.dayDragging : ''
            }`}
        >
            <div className={styles.daySortableRow}>
                <div
                    className={`${styles.daySelectButton} ${
                        isSelected ? styles.isSelected : ''
                    }`}
                    onClick={onSelect}
                >
                    <button
                        type='button'
                        className={styles.dayDragHandle}
                        aria-label={dragLabel}
                        {...attributes}
                        {...listeners}
                    >
                        <i className='ri-menu-line' aria-hidden='true' />
                    </button>
                    <span className={styles.dayTitle}>{title}</span>
                    <button
                        type='button'
                        className={`${styles.iconButton} ${styles.deleteIconButton}`}
                        onClick={onDelete}
                        aria-label={deleteLabel}
                    >
                        <i className='ri-close-line' aria-hidden='true' />
                    </button>
                </div>
            </div>
        </li>
    );
}
