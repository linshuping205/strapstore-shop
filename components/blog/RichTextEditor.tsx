'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Bold, Italic, Heading, List, ListOrdered, Link, Image, Quote, Code, Eye, Edit3, Type
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [preview, setPreview] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [lastSelection, setLastSelection] = useState<Range | null>(null);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setLastSelection(sel.getRangeAt(0));
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (!lastSelection || !editorRef.current) return;
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(lastSelection);
    }
  }, [lastSelection]);

  const exec = useCallback(
    (command: string, valueArg: string = '') => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      restoreSelection();
      document.execCommand(command, false, valueArg);
      saveSelection();
      onChange(editorRef.current.innerHTML);
    },
    [onChange, restoreSelection, saveSelection]
  );

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:', 'https://');
    if (url) exec('createLink', url);
  }, [exec]);

  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:', 'https://');
    if (url) exec('insertImage', url);
  }, [exec]);

  const insertHtml = useCallback(
    (html: string) => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      restoreSelection();
      document.execCommand('insertHTML', false, html);
      saveSelection();
      onChange(editorRef.current.innerHTML);
    },
    [onChange, restoreSelection, saveSelection]
  );

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const toolbarBtn = (icon: React.ReactNode, title: string, action: () => void, active?: boolean) => (
    <button
      type="button"
      onClick={action}
      title={title}
      className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${active ? 'bg-amber-50 text-amber-600' : 'text-gray-500'}`}
    >
      {icon}
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50 flex-wrap">
        <div className="flex items-center gap-0.5">
          {toolbarBtn(<Bold size={16} />, 'Bold', () => exec('bold'))}
          {toolbarBtn(<Italic size={16} />, 'Italic', () => exec('italic'))}
        </div>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <div className="flex items-center gap-0.5">
          {toolbarBtn(<Heading size={16} />, 'Heading 2', () => exec('formatBlock', 'H2'))}
          {toolbarBtn(<Type size={16} />, 'Paragraph', () => exec('formatBlock', 'P'))}
        </div>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <div className="flex items-center gap-0.5">
          {toolbarBtn(<List size={16} />, 'Bullet List', () => exec('insertUnorderedList'))}
          {toolbarBtn(<ListOrdered size={16} />, 'Numbered List', () => exec('insertOrderedList'))}
        </div>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <div className="flex items-center gap-0.5">
          {toolbarBtn(<Link size={16} />, 'Insert Link', insertLink)}
          {toolbarBtn(<Image size={16} />, 'Insert Image', insertImage)}
          {toolbarBtn(<Quote size={16} />, 'Quote', () => insertHtml('<blockquote class="border-l-4 border-amber-400 pl-4 py-1 my-2 text-gray-600 italic">Quote</blockquote>'))}
          {toolbarBtn(<Code size={16} />, 'Code Block', () => insertHtml('<pre class="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm overflow-x-auto my-2"><code>code</code></pre>'))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-0.5">
          {toolbarBtn(
            preview ? <Edit3 size={16} /> : <Eye size={16} />,
            preview ? 'Edit' : 'Preview',
            () => setPreview(!preview),
            preview
          )}
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="relative">
        {preview ? (
          <div
            className="prose prose-sm max-w-none p-4 min-h-[300px] max-h-[500px] overflow-y-auto bg-white"
            dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-400">Nothing to preview</p>' }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onBlur={saveSelection}
            onMouseUp={saveSelection}
            onKeyUp={saveSelection}
            className="p-4 min-h-[300px] max-h-[500px] overflow-y-auto outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
            data-placeholder={placeholder || 'Write your article here... Use the toolbar to format text.'}
            style={{ whiteSpace: 'pre-wrap' }}
            dangerouslySetInnerHTML={{ __html: value }}
          />
        )}
      </div>

      {/* HTML Source Toggle (for advanced users) */}
      <div className="border-t border-gray-100 px-3 py-2 bg-gray-50">
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-500 hover:text-gray-700 select-none">
            Raw HTML Source
          </summary>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full mt-2 p-2 text-xs font-mono bg-gray-900 text-gray-100 rounded border-0 focus:ring-1 focus:ring-amber-500"
          />
        </details>
      </div>
    </div>
  );
}
