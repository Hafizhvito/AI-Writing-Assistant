"use client";

import { useState, useRef, useEffect } from "react";
import {
  Download,
  Copy,
  FileText,
  Code2,
  ChevronDown,
  Check,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { toMarkdown, toPlainText, toHtml, downloadFile } from "@/lib/markdown";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void | Promise<void>;
}

export function ExportMenu() {
  const text = useEditorStore((s) => s.text);
  const documentTitle = useEditorStore((s) => s.documentTitle);

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function copyWithFeedback(id: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    setOpen(false);
  }

  const items: MenuItem[] = [
    {
      id: "export-md",
      label: "Export as .md",
      icon: <Download size={15} aria-hidden="true" />,
      action: () => {
        downloadFile(
          toMarkdown(text, documentTitle),
          `${documentTitle.replace(/\s+/g, "-").toLowerCase()}.md`,
          "text/markdown"
        );
        setOpen(false);
      },
    },
    {
      id: "copy-md",
      label: "Copy Markdown",
      icon: <FileText size={15} aria-hidden="true" />,
      action: () => copyWithFeedback("copy-md", toMarkdown(text, documentTitle)),
    },
    {
      id: "copy-plain",
      label: "Copy Plain Text",
      icon: <Copy size={15} aria-hidden="true" />,
      action: () => copyWithFeedback("copy-plain", toPlainText(text)),
    },
    {
      id: "copy-html",
      label: "Copy HTML",
      icon: <Code2 size={15} aria-hidden="true" />,
      action: () => copyWithFeedback("copy-html", toHtml(text, documentTitle)),
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-secondary hover:text-primary hover:bg-hover transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Download size={15} aria-hidden="true" />
        Export
        <ChevronDown
          size={13}
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-48 rounded-md bg-surface border border-border shadow-md py-1 z-50"
        >
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              onClick={item.action}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-hover transition-colors duration-100"
            >
              <span className="shrink-0">
                {copied === item.id ? (
                  <Check size={15} className="text-success" aria-hidden="true" />
                ) : (
                  item.icon
                )}
              </span>
              {copied === item.id ? (
                <span className="text-success font-medium">Copied!</span>
              ) : (
                item.label
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
