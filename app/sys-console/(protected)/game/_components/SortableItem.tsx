'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
        <div
            ref={setNodeRef}
            style={style}
            className={className}
        >
            <div
                {...attributes}
                {...listeners}
                style={{
                    cursor: 'grab',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--pico-muted-color)',
                    padding: '0.25rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                }}
            >
                <i className='ri-menu-line'></i>
            </div>
            <div
                onClick={onClick}
                style={{ flex: 1, minWidth: 0 }}
            >
                {children}
            </div>
        </div>
    );
}
