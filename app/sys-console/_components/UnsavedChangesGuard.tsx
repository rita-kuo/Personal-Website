'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmModal from './ConfirmModal';

type UnsavedModalLabels = {
    title: string;
    body: string;
    cancel: string;
    confirm: string;
};

type UnsavedChangesGuardProps = {
    isDirty: boolean;
    labels: UnsavedModalLabels;
    children: (helpers: {
        guardAction: (action: () => void) => void;
    }) => React.ReactNode | React.ReactNode[];
};

export default function UnsavedChangesGuard({
    isDirty,
    labels,
    children,
}: UnsavedChangesGuardProps) {
    const router = useRouter();
    const [isConfirming, setIsConfirming] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const pendingActionRef = useRef<(() => void) | null>(null);
    const isInternalNavigationRef = useRef(false);

    // 關閉 Modal：如果使用者按取消，我們要「補回」剛才被退掉的 dummy state
    const closeConfirmModal = useCallback(() => {
        if (isConfirming) return;
        setIsModalOpen(false);
        pendingActionRef.current = null;

        // 重要：使用者取消了，網址剛才已經退回去了，我們要再推一個回來維持攔截狀態
        if (isDirty) {
            window.history.pushState(null, '', window.location.href);
        }
    }, [isConfirming, isDirty]);

    const openConfirm = useCallback(
        (action: () => void) => {
            if (!isDirty) {
                action();
                return;
            }
            pendingActionRef.current = action;
            setIsModalOpen(true);
        },
        [isDirty],
    );

    const handleConfirm = useCallback(async () => {
        if (!pendingActionRef.current) return;
        setIsConfirming(true);
        try {
            isInternalNavigationRef.current = true;
            await pendingActionRef.current();
        } finally {
            setIsConfirming(false);
            setIsModalOpen(false);
            pendingActionRef.current = null;
        }
    }, []);

    // 1. 處理重新整理、關閉分頁
    useEffect(() => {
        if (!isDirty) return;
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // 2. 核心邏輯：修正歷史紀錄堆疊
    useEffect(() => {
        if (!isDirty) return;

        // 初始化：進來時先推一個 dummy，這會讓「上一頁」按鈕亮起，但網址不變
        window.history.pushState(null, '', window.location.href);

        const handlePopState = () => {
            if (isInternalNavigationRef.current) return;

            // 當使用者點擊「上一頁」，瀏覽器會退回到進入本頁時的狀態
            // 我們攔截它，彈出視窗
            pendingActionRef.current = () => {
                isInternalNavigationRef.current = true;
                // 連退兩次：一次是 dummy，一次是真正的上一步
                window.history.go(-2);
            };
            setIsModalOpen(true);
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isDirty]);

    return (
        <>
            {children({ guardAction: openConfirm })}
            <ConfirmModal
                isOpen={isModalOpen}
                title={labels.title}
                body={labels.body}
                cancelLabel={labels.cancel}
                confirmLabel={labels.confirm}
                isConfirming={isConfirming}
                onCancel={closeConfirmModal}
                onConfirm={handleConfirm}
            />
        </>
    );
}
