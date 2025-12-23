'use client';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import styles from '../game-editor.module.css';
import SortableItem from './SortableItem';

type LevelDetail = {
    id: string;
    name: string;
    content: string;
    actionType: string;
    meta?: any;
};

type Level = {
    id: string;
    name: string;
    slug: string;
    details: LevelDetail[];
};

type Props = {
    level: Level | null;
    selectedDetailId: string | null;
    onSelect: (id: string) => void;
    onAdd: () => void;
    onReorder: (oldIndex: number, newIndex: number) => void;
    t: any;
};

export default function LevelDetailList({
    level,
    selectedDetailId,
    onSelect,
    onAdd,
    onReorder,
    t,
}: Props) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id && level) {
            const oldIndex = level.details.findIndex(
                (item) => item.id === active.id
            );
            const newIndex = level.details.findIndex(
                (item) => item.id === over.id
            );
            onReorder(oldIndex, newIndex);
        }
    }

    if (!level) {
        return (
            <div className={styles.column}>
                <div className={styles.columnContent}></div>
            </div>
        );
    }

    return (
        <div className={styles.column}>
            <div className={styles.columnContent}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                >
                    <SortableContext
                        items={level.details.map((d) => d.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className={styles.list}>
                            {level.details.map((detail, index) => (
                                <SortableItem
                                    key={detail.id}
                                    id={detail.id}
                                    className={`${styles.listItem} ${
                                        selectedDetailId === detail.id
                                            ? styles.active
                                            : ''
                                    }`}
                                    onClick={() => onSelect(detail.id)}
                                >
                                    {detail.name ||
                                        (detail.content
                                            ? detail.content.length > 20
                                                ? detail.content.substring(
                                                      0,
                                                      20
                                                  ) + '...'
                                                : detail.content
                                            : `${t.details} ${index + 1}`)}
                                </SortableItem>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
                <div className={styles.list} style={{ marginTop: '0.25rem' }}>
                    <button
                        className={`outline ${styles.addButton}`}
                        onClick={onAdd}
                    >
                        <i className='ri-add-line'></i>
                        {t.addDetail}
                    </button>
                </div>
            </div>
        </div>
    );
}
