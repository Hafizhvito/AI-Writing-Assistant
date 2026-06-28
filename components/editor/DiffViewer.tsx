"use client";

import { wordDiff } from "@/lib/diff";
import { useTranslation } from "@/hooks/useTranslation";

interface DiffViewerProps {
  original: string;
  revised: string;
}

export default function DiffViewer({ original, revised }: DiffViewerProps) {
  const { t } = useTranslation();
  const parts = wordDiff(original, revised);

  const originalNodes = parts
    .filter((p) => p.type !== "added")
    .map((p, i) => {
      if (p.type === "removed") {
        return (
          <span
            key={i}
            style={{
              color: "var(--danger)",
              textDecoration: "line-through",
              opacity: 0.85,
            }}
          >
            {p.text}{" "}
          </span>
        );
      }
      return <span key={i}>{p.text} </span>;
    });

  const revisedNodes = parts
    .filter((p) => p.type !== "removed")
    .map((p, i) => {
      if (p.type === "added") {
        return (
          <span
            key={i}
            style={{
              color: "var(--success)",
              fontWeight: 500,
            }}
          >
            {p.text}{" "}
          </span>
        );
      }
      return <span key={i}>{p.text} </span>;
    });

  return (
    <div className="grid grid-cols-2 gap-4 text-sm" style={{ lineHeight: 1.8 }}>
      <div
        className="rounded-md p-4"
        style={{
          background: "var(--danger-light)",
          border: "1px solid var(--border-default)",
        }}
      >
        <p
          className="text-xs font-semibold mb-2 uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          {t("diff.original")}
        </p>
        <p style={{ color: "var(--text-primary)" }}>{originalNodes}</p>
      </div>

      <div
        className="rounded-md p-4"
        style={{
          background: "var(--success-light)",
          border: "1px solid var(--border-default)",
        }}
      >
        <p
          className="text-xs font-semibold mb-2 uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          {t("diff.revised")}
        </p>
        <p style={{ color: "var(--text-primary)" }}>{revisedNodes}</p>
      </div>
    </div>
  );
}
