export type AiAction =
  | "improve"
  | "grammar"
  | "summarize"
  | "expand"
  | "rewrite"
  | "rephrase";

export type Tone =
  | "professional"
  | "casual"
  | "friendly"
  | "persuasive"
  | "academic"
  | "creative";

export type GrammarIssueType = "grammar" | "spelling" | "style" | "punctuation";

export type ActivePanel = "grammar" | "result" | null;

export interface GrammarIssue {
  id: string;
  type: GrammarIssueType;
  original: string;
  suggestion: string;
  explanation: string;
}

export interface DraftSnapshot {
  id: string;
  title: string;
  text: string;
  createdAt: number;
  isSnapshot: boolean;
}

export interface EditorSelection {
  start: number;
  end: number;
  text: string;
}

export interface StorageSchema {
  version: 1;
  currentDraftId: string;
  currentDraft: DraftSnapshot;
  snapshots: DraftSnapshot[];
  theme: "light" | "dark" | null;
}

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}
