'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { arrayMove } from '@dnd-kit/sortable';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from '../game-editor.module.css';
import LevelList from './LevelList';
import LevelDetailList from './LevelDetailList';
import DetailEditor from './DetailEditor';
import LevelHeaderEditor from './LevelHeaderEditor';
import LevelModal from './LevelModal';
import { createGame, updateGame, deleteGame } from '../actions';

// Define types for form values
type DetailFormValues = {
    id: string;
    name: string;
    content: string;
    actionType: string;
    meta?: any;
};

type LevelFormValues = {
    id: string;
    name: string;
    slug: string;
    details: DetailFormValues[];
};

type GameFormValues = {
    name: string;
    slug: string;
    levels: LevelFormValues[];
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Create schema with i18n messages
    const detailSchema = z.object({
        id: z.string(),
        name: z.string().min(1, t.validation.required),
        content: z.string().min(1, t.validation.required),
        actionType: z.string(),
        meta: z.any().optional(),
    });

    const levelSchema = z.object({
        id: z.string(),
        name: z.string().min(1, t.validation.required),
        slug: z.string().min(1, t.validation.required),
        details: z.array(detailSchema),
    });

    const gameSchema = z.object({
        name: z.string().min(1, t.validation.required),
        slug: z.string().min(1, t.validation.required),
        levels: z.array(levelSchema),
    });

    const form = useForm<GameFormValues>({
        resolver: zodResolver(gameSchema),
        defaultValues: {
            name: initialGame?.name || '',
            slug: initialGame?.slug || '',
            levels:
                initialGame?.levels?.map((l) => ({
                    ...l,
                    id: String(l.id),
                    details: l.details.map((d: any) => ({
                        ...d,
                        id: String(d.id),
                    })),
                })) || [],
        },
    });

    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        getValues,
        formState: { errors },
    } = form;

    const { fields, append, remove, move, update } = useFieldArray({
        control,
        name: 'levels',
        keyName: '_rhfId',
    });

    const levels = watch('levels');

    const [selectedLevelId, setSelectedLevelId] = useState<string | null>(
        levels.length > 0 ? levels[0].id : null
    );
    const [selectedDetailId, setSelectedDetailId] = useState<string | null>(
        levels.length > 0 && levels[0].details.length > 0
            ? levels[0].details[0].id
            : null
    );

    const selectedLevelIndex = levels.findIndex(
        (l) => l.id === selectedLevelId
    );
    const selectedLevel =
        selectedLevelIndex !== -1 ? levels[selectedLevelIndex] : null;

    const selectedDetailIndex = selectedLevel
        ? selectedLevel.details.findIndex((d) => d.id === selectedDetailId)
        : -1;
    const selectedDetail =
        selectedDetailIndex !== -1 && selectedLevel
            ? selectedLevel.details[selectedDetailIndex]
            : null;

    const handleModalConfirm = (levelName: string, levelSlug: string) => {
        if (modalMode === 'add') {
            const newLevel = {
                id: `temp-${Date.now()}`,
                name: levelName,
                slug: levelSlug,
                details: [],
            };
            append(newLevel);
            setSelectedLevelId(newLevel.id);
            setSelectedDetailId(null);
        } else if (modalMode === 'edit' && selectedLevelIndex !== -1) {
            update(selectedLevelIndex, {
                ...levels[selectedLevelIndex],
                name: levelName,
                slug: levelSlug,
            });
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
        if (selectedLevelIndex === -1) return;

        const newDetail = {
            id: `temp-detail-${Date.now()}`,
            name: '',
            content: '',
            actionType: 'IMAGE',
        };

        const currentDetails = getValues(
            `levels.${selectedLevelIndex}.details`
        );
        setValue(`levels.${selectedLevelIndex}.details`, [
            ...currentDetails,
            newDetail,
        ]);
        setSelectedDetailId(newDetail.id);
    };

    const handleDeleteLevel = () => {
        if (selectedLevelIndex === -1) return;

        if (
            !confirm(
                t.confirmDeleteLevel.replace(
                    '{name}',
                    levels[selectedLevelIndex].name
                )
            )
        )
            return;

        remove(selectedLevelIndex);

        const newLevels = levels.filter((_, i) => i !== selectedLevelIndex);

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
        if (selectedLevelIndex === -1 || selectedDetailIndex === -1) return;

        const detailToDelete =
            levels[selectedLevelIndex].details[selectedDetailIndex];
        if (
            !confirm(
                t.confirmDeleteDetail.replace('{name}', detailToDelete.name)
            )
        )
            return;

        const currentDetails = getValues(
            `levels.${selectedLevelIndex}.details`
        );
        const newDetails = currentDetails.filter(
            (_, i) => i !== selectedDetailIndex
        );
        setValue(`levels.${selectedLevelIndex}.details`, newDetails);

        setSelectedDetailId(null);
    };

    const handleReorderLevels = (oldIndex: number, newIndex: number) => {
        move(oldIndex, newIndex);
    };

    const handleReorderDetails = (oldIndex: number, newIndex: number) => {
        if (selectedLevelIndex === -1) return;

        const currentDetails = getValues(
            `levels.${selectedLevelIndex}.details`
        );
        const newDetails = arrayMove(currentDetails, oldIndex, newIndex);
        setValue(`levels.${selectedLevelIndex}.details`, newDetails);
    };

    const onSubmit = async (data: GameFormValues) => {
        setIsSaving(true);

        let result;
        if (initialGame) {
            result = await updateGame(initialGame.id, data);
        } else {
            result = await createGame(data);
        }

        if (result.success) {
            router.push('/sys-console/games');
        } else {
            alert('Failed to save game');
            setIsSaving(false);
        }
    };

    const handleDeleteGame = async () => {
        if (!initialGame) return;
        if (!confirm(t.confirmDeleteGame.replace('{name}', getValues('name'))))
            return;
        setIsDeleting(true);

        const result = await deleteGame(initialGame.id);

        if (result.success) {
            router.push('/sys-console/games');
        } else {
            alert('Failed to delete game');
            setIsDeleting(false);
        }
    };

    return (
        <FormProvider {...form}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.headerField}>
                        <label>{t.gameName}</label>
                        <input
                            type='text'
                            {...register('name')}
                            placeholder={t.placeholders.name}
                        />
                        {errors.name && (
                            <span
                                style={{
                                    color: 'var(--pico-del-color)',
                                    fontSize: '0.8em',
                                }}
                            >
                                {errors.name.message}
                            </span>
                        )}
                    </div>
                    <div className={styles.headerField}>
                        <label>{t.slug}</label>
                        <input
                            type='text'
                            {...register('slug')}
                            placeholder={t.placeholders.slug}
                        />
                        {errors.slug && (
                            <span
                                style={{
                                    color: 'var(--pico-del-color)',
                                    fontSize: '0.8em',
                                }}
                            >
                                {errors.slug.message}
                            </span>
                        )}
                    </div>
                    <button
                        className={styles.saveButton}
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSaving}
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
                    <div
                        className={`${styles.headerCell} ${styles.contentHeader}`}
                    >
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
                                <i className='ri-delete-bin-line'></i>
                                {t.delete}
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
                        key={selectedDetailId || 'none'}
                        levelIndex={selectedLevelIndex}
                        detailIndex={selectedDetailIndex}
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
        </FormProvider>
    );
}
