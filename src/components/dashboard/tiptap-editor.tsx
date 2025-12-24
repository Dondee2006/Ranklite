"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorToolbar } from './editor-toolbar';
import { useEffect } from 'react';

interface TipTapEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export const TipTapEditor = ({ content, onChange, placeholder = "Start writing..." }: TipTapEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Youtube.configure({
                controls: false,
                nocookie: true,
                allowFullscreen: true,
                HTMLAttributes: {
                    class: 'rounded-xl overflow-hidden shadow-lg my-8 aspect-video w-full',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-emerald-600 underline font-medium hover:text-emerald-700 transition-colors',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl shadow-md my-8 max-w-full h-auto',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate prose-emerald max-w-none focus:outline-none min-h-[600px] p-12 font-inter leading-relaxed text-slate-800 editor-inner break-words overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900',
            },
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            const currentHTML = editor.getHTML();
            if (content !== currentHTML) {
                editor.commands.setContent(content, false);
            }
        }
    }, [content, editor]);

    if (!editor) {
        return (
            <div className="p-8 border border-slate-200 rounded-2xl bg-slate-50/50 animate-pulse flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mb-4"></div>
                <div className="font-medium text-slate-500">Preparing your creative workspace...</div>
            </div>
        );
    }

    return (
        <div className="group w-full border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-4">
            <EditorToolbar editor={editor} />
            <div className="bg-white/50 backdrop-blur-[2px]">
                <EditorContent editor={editor} />
            </div>
            <style jsx global>{`
                .tiptap {
                    transition: all 0.3s ease;
                }
                .tiptap p.is-editor-empty:first-child::before {
                    color: #94a3b8;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                    font-style: italic;
                }
                .tiptap h1 { @apply text-4xl font-extrabold text-slate-900 mb-8 tracking-tight; }
                .tiptap h2 { @apply text-2xl font-bold text-slate-800 mt-12 mb-6 tracking-tight; }
                .tiptap h3 { @apply text-xl font-semibold text-slate-800 mt-8 mb-4; }
                .tiptap p { @apply text-lg text-slate-700 leading-8 mb-6; }
                
                .tiptap .video-container {
                    position: relative;
                    padding-bottom: 56.25%;
                    height: 0;
                    overflow: hidden;
                    max-width: 100%;
                    background: #0f172a;
                    border-radius: 1.25rem;
                    margin: 3.5rem 0;
                    box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.15);
                    transition: transform 0.3s ease;
                }
                .tiptap .video-container:hover {
                    transform: scale(1.01);
                }
                .tiptap .video-container iframe {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: 0;
                }
                .tiptap img {
                    @apply rounded-2xl shadow-xl border border-slate-100 transition-all duration-300;
                }
                .tiptap img:hover {
                    @apply shadow-2xl scale-[1.005];
                }
                .tiptap img.ProseMirror-selectednode {
                    outline: 4px solid #10b981;
                    outline-offset: 4px;
                }
                .tiptap div[data-youtube-video].ProseMirror-selectednode {
                    outline: 4px solid #10b981;
                    outline-offset: 4px;
                }
                .editor-inner {
                    cursor: text;
                }
                /* Smooth scroll for the editor */
                .editor-inner {
                    scroll-behavior: smooth;
                }
            `}</style>
        </div>
    );
};
