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

type Level = {
    id: string;
    name: string;
    slug: string;
};

type Props = {
    levels: Level[];
    selectedLevelId: string | null;
    onSelect: (id: string) => void;
    onAdd: () => void;
    onReorder: (oldIndex: number, newIndex: number) => void;
    t: any;
};

export default function LevelList({
    levels,
    selectedLevelId,
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

        if (over && active.id !== over.id) {
            const oldIndex = levels.findIndex((item) => item.id === active.id);
            const newIndex = levels.findIndex((item) => item.id === over.id);
            onReorder(oldIndex, newIndex);
        }
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
                        items={levels.map((l) => l.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className={styles.list}>
                            {levels.map((level) => (
                                <SortableItem
                                    key={level.id}
                                    id={level.id}
                                    className={`${styles.listItem} ${
                                        selectedLevelId === level.id
                                            ? styles.active
                                            : ''
                                    }`}
                                    onClick={() => onSelect(level.id)}
                                >
                                    {level.name}
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
                        {t.addLevel}
                    </button>
                </div>
            </div>
        </div>
    );
}
