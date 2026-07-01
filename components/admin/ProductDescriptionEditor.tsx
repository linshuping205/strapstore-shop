'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered,
  Link, Image, Undo, Redo, Loader2, Code, Quote, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';

interface ProductDescriptionEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function ProductDescriptionEditor({
  value,
  onChange,
  placeholder = 'Describe your product features, materials, usage scenarios...'
}: ProductDescriptionEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync external value into editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // Update active formats on selection change
  const updateFormats = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('insertUnorderedList')) formats.add('ul');
    if (document.queryCommandState('insertOrderedList')) formats.add('ol');
    if (document.queryCommandState('justifyLeft')) formats.add('alignLeft');
    if (document.queryCommandState('justifyCenter')) formats.add('alignCenter');
    if (document.queryCommandState('justifyRight')) formats.add('alignRight');
    setActiveFormats(formats);
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => updateFormats();
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateFormats]);

  const exec = (command: string, valueArg?: string) => {
    document.execCommand(command, false, valueArg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateFormats();
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Image upload via existing /api/upload endpoint
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Image exceeds 4MB limit');
      return;
    }

    setUploading(true);
    try {
      const filename = `products/desc_${Date.now()}_${file.name}`;
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
        headers: {
          'x-admin-auth': 'admin-secret-token-2024',
        },
        body: file,
      });
      if (res.ok) {
        const { url } = await res.json();
        // Insert image with styling
        exec('insertHTML', `<img src="${url}" alt="Product image" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0;display:block;" />`);
      } else {
        alert('Failed to upload image');
      }
    } catch {
      alert('Upload error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) exec('createLink', url);
  };

  const toolbarBtn = (format: string, command: string, arg?: string, icon?: React.ReactNode) => {
    const isActive = activeFormats.has(format);
    return (
      <button
        type="button"
        onClick={() => exec(command, arg)}
        className={`p-2 rounded-md transition-colors ${
          isActive
            ? 'bg-amber-100 text-amber-700'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }`}
        title={format}
      >
        {icon}
      </button>
    );
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-0.5">
          {toolbarBtn('bold', 'bold', undefined, <Bold size={16} />)}
          {toolbarBtn('italic', 'italic', undefined, <Italic size={16} />)}
          {toolbarBtn('underline', 'underline', undefined, <Underline size={16} />)}
        </div>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => exec('formatBlock', 'H1')}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Heading 1"
          >
            <Heading1 size={16} />
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', 'H2')}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Heading 2"
          >
            <Heading2 size={16} />
          </button>
        </div>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <div className="flex items-center gap-0.5">
          {toolbarBtn('ul', 'insertUnorderedList', undefined, <List size={16} />)}
          {toolbarBtn('ol', 'insertOrderedList', undefined, <ListOrdered size={16} />)}
        </div>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <div className="flex items-center gap-0.5">
          {toolbarBtn('alignLeft', 'justifyLeft', undefined, <AlignLeft size={16} />)}
          {toolbarBtn('alignCenter', 'justifyCenter', undefined, <AlignCenter size={16} />)}
          {toolbarBtn('alignRight', 'justifyRight', undefined, <AlignRight size={16} />)}
        </div>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={insertLink}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Insert Link"
          >
            <Link size={16} />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-50"
            title="Insert Image"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Image size={16} />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button
            type="button"
            onClick={() => exec('formatBlock', 'blockquote')}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Quote"
          >
            <Quote size={16} />
          </button>
          <button
            type="button"
            onClick={() => exec('formatBlock', 'pre')}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Code Block"
          >
            <Code size={16} />
          </button>
        </div>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => exec('undo')}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Undo"
          >
            <Undo size={16} />
          </button>
          <button
            type="button"
            onClick={() => exec('redo')}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Redo"
          >
            <Redo size={16} />
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyUp={updateFormats}
        onMouseUp={updateFormats}
        className="min-h-[300px] p-4 text-sm text-gray-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-200 focus:ring-inset editor-content"
        data-placeholder={placeholder}
        style={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ['--editor-placeholder' as any]: `"${placeholder}"`,
        }}
      />
    </div>
  );
}
