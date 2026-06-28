import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadStorage,
  saveCurrentDraft,
  createSnapshot,
  listSidebarItems,
  pruneSnapshots,
  STORAGE_KEY,
} from "@/lib/storage";

const mockStore: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStore).forEach((k) => delete mockStore[k]);
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => mockStore[k] ?? null,
    setItem: (k: string, v: string) => {
      mockStore[k] = v;
    },
    removeItem: (k: string) => {
      delete mockStore[k];
    },
  });
});

describe("storage", () => {
  it("creates default storage on first load", () => {
    const s = loadStorage();
    expect(s.version).toBe(1);
    expect(s.currentDraft.isSnapshot).toBe(false);
  });

  it("saves current draft text", () => {
    saveCurrentDraft("Hello world draft", "My Doc");
    const s = loadStorage();
    expect(s.currentDraft.text).toBe("Hello world draft");
  });

  it("creates snapshots", () => {
    saveCurrentDraft("Some text here", "Doc");
    createSnapshot("Version 1");
    const items = listSidebarItems();
    expect(items.filter((i) => i.isSnapshot)).toHaveLength(1);
  });

  it("prunes snapshots over limit", () => {
    const s = loadStorage();
    s.snapshots = Array.from({ length: 55 }, (_, i) => ({
      id: `s${i}`,
      title: `Snap ${i}`,
      text: "content here",
      createdAt: i,
      isSnapshot: true,
    }));
    mockStore[STORAGE_KEY] = JSON.stringify(s);
    pruneSnapshots(50);
    expect(loadStorage().snapshots.length).toBe(50);
  });
});
