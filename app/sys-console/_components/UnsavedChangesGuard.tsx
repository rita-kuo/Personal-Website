'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastUrlRef = useRef<string>('');
    const pendingActionRef = useRef<(() => void) | null>(null);
    const skipPopStateRef = useRef(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const closeConfirmModal = useCallback(() => {
        if (isConfirming) return;
        setIsModalOpen(false);
        pendingActionRef.current = null;
    }, [isConfirming]);

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
            pendingActionRef.current();
        } finally {
            setIsConfirming(false);
            setIsModalOpen(false);
            pendingActionRef.current = null;
        }
    }, []);

    useEffect(() => {
        const query = searchParams?.toString();
        lastUrlRef.current = query ? `${pathname}?${query}` : pathname;
    }, [pathname, searchParams]);

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

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (skipPopStateRef.current) {
                skipPopStateRef.current = false;
                return;
            }

            if (!isDirty) return;

            event.stopImmediatePropagation();
            event.stopPropagation();

            const currentUrl = lastUrlRef.current || pathname;
            const nextUrl = window.location.href;
            window.history.pushState(null, '', currentUrl);

            const nextPath = (() => {
                try {
                    const parsed = new URL(nextUrl);
                    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
                } catch {
                    return nextUrl;
                }
            })();

            openConfirm(() => {
                skipPopStateRef.current = true;
                router.push(nextPath);
            });
        };

        window.addEventListener('popstate', handlePopState, {
            capture: true,
        });
        return () =>
            window.removeEventListener('popstate', handlePopState, {
                capture: true,
            });
    }, [isDirty, openConfirm, pathname, router]);

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
