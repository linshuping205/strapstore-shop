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
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("\u8bf7\u4e0a\u4f20\u56fe\u7247\u6587\u4ef6");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("\u56fe\u7247\u5927\u5c0f\u4e0d\u80fd\u8d85\u8fc7 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) insertImage(base64);
    };
    reader.onerror = () => alert("\u56fe\u7247\u8bfb\u53d6\u5931\u8d25");
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const insertImage = (src: string) => {
    editorRef.current?.focus();
    const imgHtml = `<img src="${src}" alt="\u56fe\u7247" style="max-width:100%;height:auto;display:block;margin:12px 0;border-radius:4px;" />`;
    document.execCommand("insertHTML", false, imgHtml);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);
      onChange(html);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("\u56fe\u7247\u5927\u5c0f\u4e0d\u80fd\u8d85\u8fc7 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) insertImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const toolbarBtn = (command: string, label: string, icon?: React.ReactNode) => (
    <button type="button" onClick={() => execCommand(command)} className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors" title={label}>
      {icon || label}
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-1">
          {toolbarBtn("bold", "\u52a0\u7c97", <b>B</b>)}
          {toolbarBtn("italic", "\u659c\u4f53", <i>I</i>)}
          {toolbarBtn("underline", "\u4e0b\u5212\u7ebf", <u>U</u>)}
          {toolbarBtn("strikeThrough", "\u5220\u9664\u7ebf", <s>S</s>)}
        </div>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <select onChange={(e) => execCommand("formatBlock", e.target.value)} className="px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-600" defaultValue="">
          <option value="">\u6b63\u6587</option>
          <option value="h1">\u6807\u9898 1</option>
          <option value="h2">\u6807\u9898 2</option>
          <option value="h3">\u6807\u9898 3</option>
          <option value="h4">\u6807\u9898 4</option>
        </select>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <div className="flex items-center gap-1">
          {toolbarBtn("justifyLeft", "\u5de6\u5bf9\u9f50", "\u5de6")}
          {toolbarBtn("justifyCenter", "\u5c45\u4e2d", "\u4e2d")}
          {toolbarBtn("justifyRight", "\u53f3\u5bf9\u9f50", "\u53f3")}
        </div>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <div className="flex items-center gap-1">
          {toolbarBtn("insertUnorderedList", "\u65e0\u5e8f\u5217\u8868", "\u2022 \u5217\u8868")}
          {toolbarBtn("insertOrderedList", "\u6709\u5e8f\u5217\u8868", "1. \u5217\u8868")}
        </div>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => { const url = prompt("\u8bf7\u8f93\u5165\u94fe\u63a5\u5730\u5740:"); if (url) execCommand("createLink", url); }} className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors">\u94fe\u63a5</button>
          <button type="button" onClick={handleImageUpload} className="px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded transition-colors flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            \u56fe\u7247
          </button>
        </div>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button type="button" onClick={() => { const color = prompt("\u8bf7\u8f93\u5165\u989c\u8272:"); if (color) execCommand("foreColor", color); }} className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors" title="\u6587\u5b57\u989c\u8272">A</button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <div className="flex items-center gap-1">
          {toolbarBtn("undo", "\u64a4\u9500", "\u21a9")}
          {toolbarBtn("redo", "\u91cd\u505a", "\u21aa")}
        </div>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        {toolbarBtn("removeFormat", "\u6e05\u9664\u683c\u5f0f", "\u6e05\u9664")}
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setShowPreview(!showPreview)} className={`px-2 py-1 text-xs rounded transition-colors ${showPreview ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}>\u9884\u89c8</button>
          <button type="button" onClick={() => setShowHtml(!showHtml)} className={`px-2 py-1 text-xs rounded transition-colors ${showHtml ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}>HTML</button>
        </div>
      </div>
      <div className="relative">
        {!showPreview && !showHtml && (
          <div ref={editorRef} contentEditable onInput={handleInput} onDrop={handleDrop} onDragOver={handleDragOver} className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none" style={{ whiteSpace: "pre-wrap" }} suppressContentEditableWarning />
        )}
        {showPreview && (
          <div className="min-h-[300px] p-4 prose prose-sm max-w-none bg-white" dangerouslySetInnerHTML={{ __html: htmlContent || "<p class=\\"text-gray-400\\">\\u6682\\u65e0\\u5185\\u5bb9</p>" }} />
        )}
        {showHtml && (
          <textarea value={htmlContent} onChange={(e) => { setHtmlContent(e.target.value); onChange(e.target.value); if (editorRef.current) editorRef.current.innerHTML = e.target.value; }} className="min-h-[300px] w-full p-4 font-mono text-xs bg-gray-50 border-0 focus:outline-none resize-y" />
        )}
      </div>
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 flex items-center justify-between">
        <span>\u652f\u6301\u62d6\u62fd\u56fe\u7247\u5230\u7f16\u8f91\u5668\u76f4\u63a5\u4e0a\u4f20</span>
        <span>Base64 \u5185\u5d4c \u00b7 \u5355\u5f20 \u2264 2MB</span>
      </div>
    </div>
  );
}
