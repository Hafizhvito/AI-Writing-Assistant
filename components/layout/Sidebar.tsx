"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Trash2, FileText } from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import type { DraftSnapshot } from "@/types";

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function getPreview(text: string): string {
  const plain = text.replace(/\s+/g, " ").trim();
  return plain.length > 60 ? plain.slice(0, 57) + "…" : plain;
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const text = useEditorStore((s) => s.text);
  const documentTitle = useEditorStore((s) => s.documentTitle);
  const snapshots = useEditorStore((s) => s.snapshots);
  const loadDraftById = useEditorStore((s) => s.loadDraftById);
  const deleteSnapshot = useEditorStore((s) => s.deleteSnapshot);

  const snapshotItems: DraftSnapshot[] = snapshots.filter((s) => s.isSnapshot);

  if (collapsed) {
    return (
      <aside
        className="hidden md:flex fixed left-0 top-[52px] bottom-0 z-40 flex-col items-center pt-3 pb-4 border-r border-border bg-surface"
        style={{ width: "48px" }}
      >
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Expand sidebar"
          className="p-2 rounded-md text-muted hover:text-primary hover:bg-hover transition-colors duration-150"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
        <div className="mt-3 flex flex-col gap-2">
          <FileText size={18} className="text-muted" aria-hidden="true" />
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="hidden md:flex fixed left-0 top-[52px] bottom-0 z-40 flex-col border-r border-border bg-surface overflow-hidden"
      style={{ width: "240px" }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted select-none">
          Drafts
        </span>
        <button
          onClick={() => setCollapsed(true)}
          aria-label="Collapse sidebar"
          className="p-1 rounded text-muted hover:text-primary hover:bg-hover transition-colors duration-150"
        >
          <ChevronLeft size={15} aria-hidden="true" />
        </button>
      </div>

      {/* Current draft – pinned */}
      <div className="px-3 pb-2 shrink-0">
        <div className="rounded-md px-3 py-2.5 bg-accent-light border border-accent/20">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-primary truncate">
              {documentTitle || "Untitled"}
            </span>
            <span className="text-[10px] font-medium text-accent shrink-0 bg-accent/10 px-1.5 py-0.5 rounded-full">
              Auto-saved
            </span>
          </div>
          {text && (
            <p className="mt-0.5 text-xs text-muted truncate">
              {getPreview(text)}
            </p>
          )}
        </div>
      </div>

      <div className="mx-3 border-t border-border my-1 shrink-0" />

      {/* Snapshots list */}
      <div className="flex-1 overflow-y-auto px-3 py-1">
        {snapshotItems.length === 0 ? (
          <p className="text-xs text-muted text-center mt-6 select-none">
            Press ⌘S to save a snapshot
          </p>
        ) : (
          <ul className="space-y-1">
            {snapshotItems.map((snap) => (
              <li
                key={snap.id}
                onMouseEnter={() => setHoveredId(snap.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative"
              >
                <button
                  onClick={() => loadDraftById(snap.id)}
                  className="w-full text-left rounded-md px-3 py-2.5 hover:bg-hover transition-colors duration-100 group"
                >
                  <div className="flex items-center justify-between gap-1 pr-5">
                    <span className="text-sm font-medium text-primary truncate">
                      {snap.title || "Snapshot"}
                    </span>
                    <span className="text-[10px] text-muted shrink-0">
                      {formatRelativeTime(snap.createdAt)}
                    </span>
                  </div>
                  {snap.text && (
                    <p className="mt-0.5 text-xs text-muted truncate">
                      {getPreview(snap.text)}
                    </p>
                  )}
                </button>

                {hoveredId === snap.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSnapshot(snap.id);
                    }}
                    aria-label={`Delete snapshot "${snap.title}"`}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted hover:text-danger hover:bg-danger/10 transition-colors duration-100"
                  >
                    <Trash2 size={13} aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
