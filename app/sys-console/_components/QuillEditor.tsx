'use client';

import { useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import type ReactQuillType from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const formats = ['bold', 'italic', 'underline', 'list', 'link', 'image'];

type QuillEditorProps = {
    value: string;
    onChange: (value: string) => void;
    className?: string;
};

export default function QuillEditor({
    value,
    onChange,
    className,
}: QuillEditorProps) {
    const quillRef = useRef<ReactQuillType | null>(null);

    const imageHandler = useCallback(() => {
        const url = prompt('輸入圖片網址：');
        if (!url) return;
        const editor = quillRef.current?.getEditor();
        if (!editor) return;
        const range = editor.getSelection(true);
        editor.insertEmbed(range.index, 'image', url);
        editor.setSelection(range.index + 1, 0);
    }, []);

    const modules = {
        toolbar: {
            container: [
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
            ],
            handlers: {
                image: imageHandler,
            },
        },
    };

    return (
        <div className={className}>
            <ReactQuill
                ref={quillRef}
                theme='snow'
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
            />
        </div>
    );
}
