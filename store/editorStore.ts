import { create } from "zustand";
import type {
  AiAction,
  ActivePanel,
  DraftSnapshot,
  EditorSelection,
  GrammarIssue,
  Tone,
} from "@/types";
import {
  loadStorage,
  listSidebarItems,
  saveCurrentDraft,
  switchToDraft,
  createSnapshot as storageCreateSnapshot,
  deleteSnapshot as storageDeleteSnapshot,
} from "@/lib/storage";
import { callAiApi } from "@/lib/api";
import { translate } from "@/lib/i18n/translations";
import { useLocaleStore } from "@/store/localeStore";

interface EditorState {
  text: string;
  documentTitle: string;
  selection: EditorSelection | null;
  selectedTone: Tone;
  isLoading: boolean;
  loadingAction: AiAction | null;
  aiResult: string | null;
  grammarIssues: GrammarIssue[];
  activePanel: ActivePanel;
  showDiff: boolean;
  snapshots: DraftSnapshot[];
  lastAiUsedSelection: boolean;
  aiError: string | null;
  lastAiAction: AiAction | null;
}

interface EditorActions {
  setText: (text: string) => void;
  setDocumentTitle: (title: string) => void;
  setSelection: (selection: EditorSelection | null) => void;
  setSelectedTone: (tone: Tone) => void;
  setLoading: (isLoading: boolean, action?: AiAction | null) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setShowDiff: (showDiff: boolean) => void;
  getAiTargetText: () => string;
  hydrateFromStorage: () => void;
  loadDraftById: (id: string) => void;
  createSnapshot: (title?: string) => void;
  deleteSnapshot: (id: string) => void;
  runAiAction: (action: AiAction) => Promise<void>;
  applyResult: () => void;
  discardResult: () => void;
  applyGrammarFix: (id: string) => void;
  applyAllGrammarFixes: () => void;
  clearAiError: () => void;
}

type EditorStore = EditorState & EditorActions;

export const useEditorStore = create<EditorStore>((set, get) => ({
  text: "",
  documentTitle: "Untitled",
  selection: null,
  selectedTone: "professional",
  isLoading: false,
  loadingAction: null,
  aiResult: null,
  grammarIssues: [],
  activePanel: null,
  showDiff: false,
  snapshots: [],
  lastAiUsedSelection: false,
  aiError: null,
  lastAiAction: null,

  setText: (text) => set({ text }),

  setDocumentTitle: (documentTitle) => set({ documentTitle }),

  setSelection: (selection) => set({ selection }),

  setSelectedTone: (selectedTone) => set({ selectedTone }),

  setLoading: (isLoading, action = null) =>
    set({ isLoading, loadingAction: isLoading ? action : null }),

  setActivePanel: (activePanel) => set({ activePanel }),

  setShowDiff: (showDiff) => set({ showDiff }),

  getAiTargetText: () => {
    const { selection, text } = get();
    if (selection && selection.start !== selection.end) return selection.text;
    return text;
  },

  hydrateFromStorage: () => {
    const data = loadStorage();
    const snapshots = listSidebarItems();
    set({
      text: data.currentDraft.text,
      documentTitle: data.currentDraft.title,
      snapshots,
    });
  },

  loadDraftById: (id) => {
    const { text, documentTitle } = get();
    saveCurrentDraft(text, documentTitle);
    const data = switchToDraft(id);
    const snapshots = listSidebarItems();
    set({
      text: data.currentDraft.text,
      documentTitle: data.currentDraft.title,
      snapshots,
      activePanel: null,
      aiResult: null,
      grammarIssues: [],
      showDiff: false,
    });
  },

  createSnapshot: (title) => {
    storageCreateSnapshot(title);
    const snapshots = listSidebarItems();
    set({ snapshots });
  },

  deleteSnapshot: (id) => {
    storageDeleteSnapshot(id);
    const snapshots = listSidebarItems();
    set({ snapshots });
  },

  runAiAction: async (action) => {
    const { getAiTargetText, selection, selectedTone } = get();
    const targetText = getAiTargetText();

    if (targetText.trim().length < 10) {
      const locale = useLocaleStore.getState().locale;
      set({ aiError: translate(locale, "errors.textTooShort") });
      return;
    }

    const usedSelection = !!(selection && selection.start !== selection.end);

    set({
      isLoading: true,
      loadingAction: action,
      aiError: null,
      lastAiAction: action,
      lastAiUsedSelection: usedSelection,
    });

    try {
      const tone = action === "rewrite" ? selectedTone : undefined;
      const data = await callAiApi(action, targetText, tone);

      if (action === "grammar") {
        set({
          grammarIssues: data.result as GrammarIssue[],
          activePanel: "grammar",
          aiResult: null,
        });
      } else {
        set({
          aiResult: data.result as string,
          activePanel: "result",
          grammarIssues: [],
        });
      }
    } catch (err) {
      const locale = useLocaleStore.getState().locale;
      const message =
        err instanceof Error
          ? err.message
          : translate(locale, "errors.generic");
      set({ aiError: message });
    } finally {
      set({ isLoading: false, loadingAction: null });
    }
  },

  applyResult: () => {
    const { aiResult, lastAiUsedSelection, selection, text } = get();
    if (!aiResult) return;

    let newText: string;
    if (lastAiUsedSelection && selection && selection.start !== selection.end) {
      newText =
        text.slice(0, selection.start) + aiResult + text.slice(selection.end);
    } else {
      newText = aiResult;
    }

    set({
      text: newText,
      aiResult: null,
      activePanel: null,
      showDiff: false,
      selection: null,
    });
  },

  discardResult: () => {
    set({ aiResult: null, activePanel: null });
  },

  applyGrammarFix: (id) => {
    const { grammarIssues, text } = get();
    const issue = grammarIssues.find((i) => i.id === id);
    if (!issue) return;

    const idx = text.indexOf(issue.original);
    if (idx === -1) return;

    const newText =
      text.slice(0, idx) + issue.suggestion + text.slice(idx + issue.original.length);

    set({
      text: newText,
      grammarIssues: grammarIssues.filter((i) => i.id !== id),
    });
  },

  applyAllGrammarFixes: () => {
    const { grammarIssues, text } = get();
    if (grammarIssues.length === 0) return;

    // Build list of (index, issue) pairs then sort descending so we patch from end to start
    const located: Array<{ idx: number; issue: GrammarIssue }> = [];
    for (const issue of grammarIssues) {
      const idx = text.indexOf(issue.original);
      if (idx !== -1) located.push({ idx, issue });
    }

    located.sort((a, b) => b.idx - a.idx);

    let newText = text;
    for (const { idx, issue } of located) {
      newText =
        newText.slice(0, idx) +
        issue.suggestion +
        newText.slice(idx + issue.original.length);
    }

    set({ text: newText, grammarIssues: [], activePanel: null });
  },

  clearAiError: () => set({ aiError: null }),
}));
