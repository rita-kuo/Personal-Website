'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from '../game-editor.module.css';

type Props = {
    id: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
};

export default function SortableItem({
    id,
    children,
    className,
    onClick,
}: Props) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className={className}>
            <div {...attributes} {...listeners} className={styles.dragHandle}>
                <i className='ri-menu-line'></i>
            </div>
            <div onClick={onClick} className={styles.sortableContent}>
                {children}
            </div>
        </div>
    );
}
