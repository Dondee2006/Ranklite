"use client";

import { Editor } from '@tiptap/react';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Image as ImageIcon, // Reserved for future use
    Youtube as YoutubeIcon,
    Heading1,
    Heading2,
    Heading3,
    Eraser,
    Plus,
} from 'lucide-react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface EditorToolbarProps {
    editor: Editor | null;
}

export const EditorToolbar = ({ editor }: EditorToolbarProps) => {
    const [linkUrl, setLinkUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isLinkOpen, setIsLinkOpen] = useState(false);
    const [isYoutubeOpen, setIsYoutubeOpen] = useState(false);

    if (!editor) return null;

    const handleAddYoutubeVideo = () => {
        if (youtubeUrl) {
            editor.commands.setYoutubeVideo({
                src: youtubeUrl,
            });
            setYoutubeUrl('');
            setIsYoutubeOpen(false);
        }
    };

    const handleAddLink = () => {
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl('');
            setIsLinkOpen(false);
        }
    };

    const ToolbarButton = ({
        onClick,
        isActive = false,
        children,
        title,
        className = ""
    }: {
        onClick?: () => void;
        isActive?: boolean;
        children: React.ReactNode;
        title: string;
        className?: string;
    }) => (
        <button
            onClick={(e) => {
                if (onClick) {
                    e.preventDefault();
                    onClick();
                }
            }}
            className={`p-2 rounded-lg transition-all duration-300 transform active:scale-95 ${isActive
                ? 'bg-emerald-100 text-emerald-700 shadow-sm ring-1 ring-emerald-200'
                : 'text-slate-500 hover:bg-white hover:text-emerald-600 hover:shadow-md'
                } ${className}`}
            title={title}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 border-b border-white/20 bg-white/60 backdrop-blur-md sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-1 px-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="h-4.5 w-4.5" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="h-4.5 w-4.5" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="h-4.5 w-4.5" />
                </ToolbarButton>
            </div>

            <Separator orientation="vertical" className="h-6 bg-slate-200/50 mx-1" />

            <div className="flex items-center gap-1 px-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold"
                >
                    <Bold className="h-4.5 w-4.5" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic"
                >
                    <Italic className="h-4.5 w-4.5" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Quote"
                >
                    <Quote className="h-4.5 w-4.5" />
                </ToolbarButton>
            </div>

            <Separator orientation="vertical" className="h-6 bg-slate-200/50 mx-1" />

            <div className="flex items-center gap-1 px-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="h-4.5 w-4.5" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Ordered List"
                >
                    <ListOrdered className="h-4.5 w-4.5" />
                </ToolbarButton>
            </div>

            <Separator orientation="vertical" className="h-6 bg-slate-200/50 mx-1" />

            <div className="flex items-center gap-1 px-1">
                <Popover open={isLinkOpen} onOpenChange={setIsLinkOpen}>
                    <PopoverTrigger asChild>
                        <ToolbarButton isActive={editor.isActive('link')} title="Add Link">
                            <LinkIcon className="h-4.5 w-4.5" />
                        </ToolbarButton>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="start">
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm">Insert Link</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://example.com"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="h-8"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddLink();
                                    }}
                                />
                                <Button size="sm" onClick={handleAddLink} className="bg-emerald-600 hover:bg-emerald-700 h-8">
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <Popover open={isYoutubeOpen} onOpenChange={setIsYoutubeOpen}>
                    <PopoverTrigger asChild>
                        <ToolbarButton title="Add YouTube Video">
                            <YoutubeIcon className="h-4.5 w-4.5 text-red-500" />
                        </ToolbarButton>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="start">
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm">Embed YouTube Video</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="YouTube URL"
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    className="h-8"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddYoutubeVideo();
                                    }}
                                />
                                <Button size="sm" onClick={handleAddYoutubeVideo} className="bg-emerald-600 hover:bg-emerald-700 h-8">
                                    Embed
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex items-center gap-1 px-1 ml-auto">
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                    <Undo className="h-4.5 w-4.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
                    <Redo className="h-4.5 w-4.5" />
                </ToolbarButton>
                <Separator orientation="vertical" className="h-6 bg-slate-200/50 mx-1" />
                <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Clear Formatting">
                    <Eraser className="h-4.5 w-4.5" />
                </ToolbarButton>
            </div>
        </div>
    );
};
