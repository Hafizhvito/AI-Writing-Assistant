import type { DraftSnapshot, StorageSchema } from "@/types";

export const STORAGE_KEY = "writeflow:v1";
const MAX_SNAPSHOTS = 50;

function defaultDraft(): DraftSnapshot {
  const id = crypto.randomUUID();
  return {
    id,
    title: "Untitled",
    text: "",
    createdAt: Date.now(),
    isSnapshot: false,
  };
}

function defaultStorage(): StorageSchema {
  const draft = defaultDraft();
  return {
    version: 1,
    currentDraftId: draft.id,
    currentDraft: draft,
    snapshots: [],
    theme: null,
  };
}

function persist(data: StorageSchema): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      pruneSnapshots(Math.floor(MAX_SNAPSHOTS / 2));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }
}

export function loadStorage(): StorageSchema {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStorage();
    const parsed = JSON.parse(raw) as StorageSchema;
    if (parsed.version !== 1) return defaultStorage();
    return parsed;
  } catch {
    return defaultStorage();
  }
}

export function saveCurrentDraft(text: string, title: string): StorageSchema {
  const data = loadStorage();
  data.currentDraft = {
    ...data.currentDraft,
    text,
    title,
    createdAt: Date.now(),
    isSnapshot: false,
  };
  data.currentDraftId = data.currentDraft.id;
  persist(data);
  return data;
}

export function createSnapshot(title?: string): StorageSchema {
  const data = loadStorage();
  const snapshot: DraftSnapshot = {
    id: crypto.randomUUID(),
    title: title || `Snapshot ${new Date().toLocaleString()}`,
    text: data.currentDraft.text,
    createdAt: Date.now(),
    isSnapshot: true,
  };
  data.snapshots.unshift(snapshot);
  pruneSnapshots(MAX_SNAPSHOTS);
  persist(data);
  return data;
}

export function loadDraft(id: string): DraftSnapshot | null {
  const data = loadStorage();
  if (data.currentDraft.id === id) return data.currentDraft;
  return data.snapshots.find((s) => s.id === id) ?? null;
}

export function deleteSnapshot(id: string): StorageSchema {
  const data = loadStorage();
  data.snapshots = data.snapshots.filter((s) => s.id !== id);
  persist(data);
  return data;
}

export function listSidebarItems(): DraftSnapshot[] {
  const data = loadStorage();
  return [data.currentDraft, ...data.snapshots.sort((a, b) => b.createdAt - a.createdAt)];
}

export function pruneSnapshots(max = MAX_SNAPSHOTS): void {
  const data = loadStorage();
  if (data.snapshots.length > max) {
    data.snapshots = data.snapshots
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, max);
    persist(data);
  }
}

export function switchToDraft(id: string): StorageSchema {
  const data = loadStorage();
  const target = loadDraft(id);
  if (!target || target.id === data.currentDraft.id) return data;

  saveCurrentDraft(data.currentDraft.text, data.currentDraft.title);

  const refreshed = loadStorage();
  if (target.isSnapshot) {
    refreshed.currentDraft = {
      ...target,
      id: crypto.randomUUID(),
      isSnapshot: false,
      createdAt: Date.now(),
    };
  } else {
    refreshed.currentDraft = { ...target };
  }
  refreshed.currentDraftId = refreshed.currentDraft.id;
  persist(refreshed);
  return refreshed;
}
