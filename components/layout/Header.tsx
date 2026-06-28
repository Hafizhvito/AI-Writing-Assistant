"use client";

import { useRef, useState, useEffect, KeyboardEvent } from "react";
import { Pencil } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ExportMenu } from "@/components/ui/ExportMenu";
import WordCount from "@/components/editor/WordCount";

export function Header() {
  const documentTitle = useEditorStore((s) => s.documentTitle);
  const setDocumentTitle = useEditorStore((s) => s.setDocumentTitle);
  const text = useEditorStore((s) => s.text);
  const selection = useEditorStore((s) => s.selection);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(documentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(documentTitle);
      inputRef.current?.select();
    }
  }, [editing, documentTitle]);

  function commitEdit() {
    const trimmed = draft.trim();
    setDocumentTitle(trimmed || "Untitled");
    setEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") {
      setDraft(documentTitle);
      setEditing(false);
    }
  }

  const selectionWords =
    selection && selection.start !== selection.end
      ? selection.text.trim() === ""
        ? 0
        : selection.text.trim().split(/\s+/).length
      : null;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-4 gap-3 bg-surface border-b border-border backdrop-blur supports-[backdrop-filter]:bg-surface/80"
      style={{ height: "52px" }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2 shrink-0 select-none">
        <Pencil size={18} className="text-accent" aria-hidden="true" />
        <span className="font-semibold text-primary text-sm tracking-tight">
          Writeflow
        </span>
      </div>

      {/* Center: editable document title */}
      <div className="flex-1 flex items-center justify-center">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="text-sm font-medium text-primary bg-transparent border-b border-accent outline-none text-center w-48 max-w-xs px-1"
            aria-label="Document title"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm font-medium text-primary hover:text-accent transition-colors duration-150 rounded px-2 py-0.5 hover:bg-hover max-w-xs truncate"
            title="Click to edit title"
          >
            {documentTitle}
          </button>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        {selectionWords !== null && (
          <span className="text-xs font-medium bg-accent-light text-accent px-2 py-0.5 rounded-full">
            {selectionWords} {selectionWords === 1 ? "word" : "words"} selected
          </span>
        )}
        <WordCount text={text} />
        <ExportMenu />
        <ThemeToggle />
      </div>
    </header>
  );
}
