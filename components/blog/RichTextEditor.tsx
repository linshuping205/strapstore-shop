"use client";

import { useState, useRef, useEffect } from "react";

interface RichTextEditorProps {
  initialContent?: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ initialContent = "", onChange }: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  const [htmlContent, setHtmlContent] = useState(initialContent);
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);
      onChange(html);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);
      onChange(html);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const uploadToBlob = async (file: File): Promise<string | null> => {
    if (file.size > 4 * 1024 * 1024) {
      alert("Image size cannot exceed 4MB");
      return null;
    }
    setUploading(true);
    try {
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: "POST",
        headers: {
          'x-admin-auth': 'admin-secret-token-2024',
        },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.url;
    } catch (e) {
      alert("Upload failed, please try again");
      console.error(e);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }
    const url = await uploadToBlob(file);
    if (url) insertImage(url);
    e.target.value = "";
  };

  const insertImage = (src: string) => {
    editorRef.current?.focus();
    const img = '<img src="' + src + '" alt="image" style="max-width:100%;height:auto;display:block;margin:12px 0;border-radius:4px;" />';
    document.execCommand("insertHTML", false, img);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);
      onChange(html);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = await uploadToBlob(file);
    if (url) insertImage(url);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const ToolbarBtn = ({ cmd, label, icon }: { cmd: string; label: string; icon?: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => execCmd(cmd)}
      className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
      title={label}
    >
      {icon || label}
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <ToolbarBtn cmd="bold" label="Bold" icon={<b>B</b>} />
          <ToolbarBtn cmd="italic" label="Italic" icon={<i>I</i>} />
          <ToolbarBtn cmd="underline" label="Underline" icon={<u>U</u>} />
          <ToolbarBtn cmd="strikeThrough" label="Strikethrough" icon={<s>S</s>} />
        </div>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <select
          onChange={(e) => execCmd("formatBlock", e.target.value)}
          className="px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-600"
          defaultValue=""
        >
          <option value="">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <div className="flex items-center gap-1">
          <ToolbarBtn cmd="justifyLeft" label="Left" />
          <ToolbarBtn cmd="justifyCenter" label="Center" />
          <ToolbarBtn cmd="justifyRight" label="Right" />
        </div>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <div className="flex items-center gap-1">
          <ToolbarBtn cmd="insertUnorderedList" label="Bullet List" />
          <ToolbarBtn cmd="insertOrderedList" label="Numbered List" />
        </div>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              const url = prompt("Enter link URL:");
              if (url) execCmd("createLink", url);
            }}
            className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            Link
          </button>
          <button
            type="button"
            onClick={handleImageUpload}
            disabled={uploading}
            className="px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            {uploading ? (
              <span className="w-3.5 h-3.5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            {uploading ? "Uploading..." : "Image"}
          </button>
        </div>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => {
            const color = prompt("Enter color (e.g. #ff0000 or red):");
            if (color) execCmd("foreColor", color);
          }}
          className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Text Color"
        >
          A
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <div className="flex items-center gap-1">
          <ToolbarBtn cmd="undo" label="Undo" />
          <ToolbarBtn cmd="redo" label="Redo" />
        </div>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <ToolbarBtn cmd="removeFormat" label="Clear Format" />
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={"px-2 py-1 text-xs rounded transition-colors " + (showPreview ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100")}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => setShowHtml(!showHtml)}
            className={"px-2 py-1 text-xs rounded transition-colors " + (showHtml ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100")}
          >
            HTML
          </button>
        </div>
      </div>
      <div className="relative">
        {!showPreview && !showHtml && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none"
            style={{ whiteSpace: "pre-wrap" }}
            suppressContentEditableWarning
          />
        )}
        {showPreview && (
          <div
            className="min-h-[300px] p-4 prose prose-sm max-w-none bg-white"
            dangerouslySetInnerHTML={{ __html: htmlContent || '<p class="text-gray-400">No content</p>' }}
          />
        )}
        {showHtml && (
          <textarea
            value={htmlContent}
            onChange={(e) => {
              setHtmlContent(e.target.value);
              onChange(e.target.value);
              if (editorRef.current) {
                editorRef.current.innerHTML = e.target.value;
              }
            }}
            className="min-h-[300px] w-full p-4 font-mono text-xs bg-gray-50 border-0 focus:outline-none resize-y"
          />
        )}
      </div>
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 flex items-center justify-between">
        <span>Click Image button or drag and drop to upload</span>
        <span>Vercel Blob Storage · Max 4MB per image</span>
      </div>
    </div>
  );
}
