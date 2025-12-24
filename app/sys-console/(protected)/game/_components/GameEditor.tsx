'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { arrayMove } from '@dnd-kit/sortable';
import styles from '../game-editor.module.css';
import LevelList from './LevelList';
import LevelDetailList from './LevelDetailList';
import DetailEditor from './DetailEditor';
import LevelHeaderEditor from './LevelHeaderEditor';
import LevelModal from './LevelModal';
import { createGame } from '../actions';

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
    t: any;
};

export default function GameEditor({ t }: Props) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [levels, setLevels] = useState<Level[]>([]);
    const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
    const [selectedDetailId, setSelectedDetailId] = useState<string | null>(
        null
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [isSaving, setIsSaving] = useState(false);

    const handleModalConfirm = (levelName: string, levelSlug: string) => {
        if (modalMode === 'add') {
            const newLevel: Level = {
                id: `temp-${Date.now()}`,
                name: levelName,
                slug: levelSlug,
                details: [],
            };
            setLevels([...levels, newLevel]);
            setSelectedLevelId(newLevel.id);
            setSelectedDetailId(null);
        } else if (modalMode === 'edit' && selectedLevelId) {
            setLevels(
                levels.map((l) =>
                    l.id === selectedLevelId
                        ? { ...l, name: levelName, slug: levelSlug }
                        : l
                )
            );
        }
        setIsModalOpen(false);
    };

    const openAddModal = () => {
        setModalMode('add');
        setIsModalOpen(true);
    };

    const openEditModal = () => {
        if (selectedLevelId) {
            setModalMode('edit');
            setIsModalOpen(true);
        }
    };

    const handleAddDetail = () => {
        if (!selectedLevelId) return;

        const newDetail: LevelDetail = {
            id: `temp-detail-${Date.now()}`,
            name: '',
            content: '',
            actionType: 'NONE',
        };

        setLevels(
            levels.map((l) => {
                if (l.id === selectedLevelId) {
                    return { ...l, details: [...l.details, newDetail] };
                }
                return l;
            })
        );
        setSelectedDetailId(newDetail.id);
    };

    const handleUpdateDetail = (id: string, field: string, value: any) => {
        if (!selectedLevelId) return;

        setLevels(
            levels.map((l) => {
                if (l.id === selectedLevelId) {
                    return {
                        ...l,
                        details: l.details.map((d) =>
                            d.id === id ? { ...d, [field]: value } : d
                        ),
                    };
                }
                return l;
            })
        );
    };

    const handleReorderLevels = (oldIndex: number, newIndex: number) => {
        setLevels((items) => arrayMove(items, oldIndex, newIndex));
    };

    const handleReorderDetails = (oldIndex: number, newIndex: number) => {
        if (!selectedLevelId) return;

        setLevels((prevLevels) => {
            return prevLevels.map((level) => {
                if (level.id === selectedLevelId) {
                    return {
                        ...level,
                        details: arrayMove(level.details, oldIndex, newIndex),
                    };
                }
                return level;
            });
        });
    };

    const handleSave = async () => {
        if (!name || !slug) return;
        setIsSaving(true);

        const result = await createGame({
            name,
            slug,
            levels,
        });

        if (result.success) {
            router.push(`/sys-console/games/${result.id}`);
        } else {
            alert('Failed to save game');
            setIsSaving(false);
        }
    };

    const selectedLevel = levels.find((l) => l.id === selectedLevelId) || null;
    const selectedDetail =
        selectedLevel?.details.find((d) => d.id === selectedDetailId) || null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerField}>
                    <label>{t.gameName}</label>
                    <input
                        type='text'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.placeholders.name}
                    />
                </div>
                <div className={styles.headerField}>
                    <label>{t.slug}</label>
                    <input
                        type='text'
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder={t.placeholders.slug}
                    />
                </div>
                <button
                    className={styles.saveButton}
                    onClick={handleSave}
                    disabled={isSaving || !name || !slug}
                >
                    {isSaving ? t.saving : t.save}
                </button>
            </div>

            <article className={styles.workspace}>
                <div className={styles.headerCell}>
                    <h2>{t.levels}</h2>
                </div>
                <div className={styles.headerCell}>
                    <LevelHeaderEditor
                        level={selectedLevel}
                        onEdit={openEditModal}
                        t={t}
                    />
                </div>
                <div className={styles.headerCell}>
                    <h2>{t.content}</h2>
                </div>

                <LevelList
                    levels={levels}
                    selectedLevelId={selectedLevelId}
                    onSelect={(id) => {
                        setSelectedLevelId(id);
                        const level = levels.find((l) => l.id === id);
                        if (level && level.details.length > 0) {
                            setSelectedDetailId(level.details[0].id);
                        } else {
                            setSelectedDetailId(null);
                        }
                    }}
                    onAdd={openAddModal}
                    onReorder={handleReorderLevels}
                    t={t}
                />
                <LevelDetailList
                    level={selectedLevel}
                    selectedDetailId={selectedDetailId}
                    onSelect={setSelectedDetailId}
                    onAdd={handleAddDetail}
                    onReorder={handleReorderDetails}
                    t={t}
                />
                <DetailEditor
                    detail={selectedDetail}
                    onUpdate={handleUpdateDetail}
                    t={t}
                />
            </article>

            <LevelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleModalConfirm}
                initialName={
                    modalMode === 'edit' && selectedLevel
                        ? selectedLevel.name
                        : ''
                }
                initialSlug={
                    modalMode === 'edit' && selectedLevel
                        ? selectedLevel.slug
                        : ''
                }
                title={
                    modalMode === 'add'
                        ? t.modal.addLevelTitle
                        : t.modal.editLevelTitle || 'Edit Level'
                }
                confirmLabel={
                    modalMode === 'edit' ? t.modal.save : t.modal.create
                }
                t={t}
            />
        </div>
    );
}
