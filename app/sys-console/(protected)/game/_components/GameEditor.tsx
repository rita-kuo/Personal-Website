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
import { createGame, updateGame, deleteGame } from '../actions';

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
    initialGame?: {
        id: number;
        name: string;
        slug: string;
        levels: any[];
    };
    t: any;
};

export default function GameEditor({ initialGame, t }: Props) {
    const router = useRouter();
    const [name, setName] = useState(initialGame?.name || '');
    const [slug, setSlug] = useState(initialGame?.slug || '');
    const [levels, setLevels] = useState<Level[]>(
        initialGame?.levels.map((l) => ({
            ...l,
            id: String(l.id),
            details: l.details.map((d: any) => ({ ...d, id: String(d.id) })),
        })) || []
    );
    const [selectedLevelId, setSelectedLevelId] = useState<string | null>(
        levels.length > 0 ? levels[0].id : null
    );
    const [selectedDetailId, setSelectedDetailId] = useState<string | null>(
        levels.length > 0 && levels[0].details.length > 0
            ? levels[0].details[0].id
            : null
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleDeleteLevel = () => {
        if (!selectedLevelId) return;
        const levelToDelete = levels.find((l) => l.id === selectedLevelId);
        if (!levelToDelete) return;

        if (
            !confirm(t.confirmDeleteLevel.replace('{name}', levelToDelete.name))
        )
            return;

        const newLevels = levels.filter((l) => l.id !== selectedLevelId);
        setLevels(newLevels);
        if (newLevels.length > 0) {
            setSelectedLevelId(newLevels[0].id);
            if (newLevels[0].details.length > 0) {
                setSelectedDetailId(newLevels[0].details[0].id);
            } else {
                setSelectedDetailId(null);
            }
        } else {
            setSelectedLevelId(null);
            setSelectedDetailId(null);
        }
    };

    const handleDeleteDetail = () => {
        if (!selectedLevelId || !selectedDetailId) return;

        const level = levels.find((l) => l.id === selectedLevelId);
        if (!level) return;

        const detailToDelete = level.details.find(
            (d) => d.id === selectedDetailId
        );
        if (!detailToDelete) return;

        if (
            !confirm(
                t.confirmDeleteDetail.replace('{name}', detailToDelete.name)
            )
        )
            return;

        setLevels(
            levels.map((l) => {
                if (l.id === selectedLevelId) {
                    const newDetails = l.details.filter(
                        (d) => d.id !== selectedDetailId
                    );
                    return { ...l, details: newDetails };
                }
                return l;
            })
        );
        setSelectedDetailId(null);
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

        let result;
        if (initialGame) {
            result = await updateGame(initialGame.id, {
                name,
                slug,
                levels,
            });
        } else {
            result = await createGame({
                name,
                slug,
                levels,
            });
        }

        if (result.success) {
            router.push('/sys-console/games');
            router.refresh();
        } else {
            alert('Failed to save game');
            setIsSaving(false);
        }
    };

    const handleDeleteGame = async () => {
        if (!initialGame) return;
        if (!confirm(t.confirmDeleteGame.replace('{name}', name))) return;
        setIsDeleting(true);

        const result = await deleteGame(initialGame.id);

        if (result.success) {
            router.push('/sys-console/games');
        } else {
            alert('Failed to delete game');
            setIsDeleting(false);
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
                {initialGame && (
                    <button
                        className={`${styles.saveButton} outline secondary`}
                        onClick={handleDeleteGame}
                        disabled={isDeleting}
                    >
                        {isDeleting ? t.deleting : t.delete}
                    </button>
                )}
            </div>

            <article className={styles.workspace}>
                <div className={styles.headerCell}>
                    <h2>{t.levels}</h2>
                </div>
                <div className={styles.headerCell}>
                    <LevelHeaderEditor
                        level={selectedLevel}
                        onEdit={openEditModal}
                        onDelete={handleDeleteLevel}
                        t={t}
                    />
                </div>
                <div className={`${styles.headerCell} ${styles.contentHeader}`}>
                    <h2>{t.content}</h2>
                    {selectedDetailId && (
                        <button
                            className='outline secondary'
                            onClick={handleDeleteDetail}
                            style={{
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.8rem',
                                width: 'auto',
                            }}
                        >
                            <i className='ri-delete-bin-line'></i> {t.delete}
                        </button>
                    )}
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
                    onDelete={handleDeleteDetail}
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
