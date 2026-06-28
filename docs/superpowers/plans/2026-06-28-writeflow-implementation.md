# Writeflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready AI writing assistant (Writeflow) with Next.js 14, Gemini 1.5 Flash, localStorage drafts, command palette, and full security hardening.

**Architecture:** Client-heavy SPA shell inside Next.js App Router. Zustand manages editor/AI state; localStorage persists drafts. All AI traffic proxies through `/api/ai` with Zod validation and in-memory rate limiting. Plain textarea editor with selection-aware AI scope.

**Tech Stack:** Next.js 14, React 18, Tailwind CSS, Zustand, Framer Motion, Zod, Lucide React, Vitest (lib unit tests only)

**Spec reference:** `docs/superpowers/specs/2026-06-28-writeflow-design.md`

---

## File Map

| File | Responsibility |
|------|----------------|
| `next.config.js` | Security headers |
| `tailwind.config.ts` | Tailwind + CSS variable colors |
| `app/globals.css` | Theme CSS variables, typography scale |
| `app/layout.tsx` | Inter font, theme flash script, metadata |
| `app/page.tsx` | Main client page assembly |
| `app/api/ai/route.ts` | Validate, rate limit, call Gemini |
| `types/index.ts` | All shared TypeScript types |
| `lib/validations.ts` | Zod schemas (request + grammar issue) |
| `lib/rateLimiter.ts` | Sliding window IP limiter |
| `lib/gemini.ts` | Gemini REST client + system prompts |
| `lib/storage.ts` | localStorage draft/snapshot CRUD |
| `lib/markdown.ts` | Text to markdown / HTML export |
| `lib/diff.ts` | Word-level diff for DiffViewer |
| `lib/animations.ts` | Framer Motion config presets |
| `lib/api.ts` | Client-side `/api/ai` fetch wrapper |
| `lib/utils.ts` | `cn()` clsx + tailwind-merge helper |
| `store/editorStore.ts` | Zustand global state |
| `hooks/useAutoSave.ts` | Debounced draft persistence |
| `hooks/useKeyboardShortcuts.ts` | Global shortcut bindings |
| `hooks/useEditorStats.ts` | Word/char/reading time |
| `hooks/useReducedMotion.ts` | prefers-reduced-motion hook |
| `components/ui/*` | Button, Toast, Spinner, Tooltip, ThemeToggle, ExportMenu, CommandPalette, ShortcutsModal |
| `components/editor/*` | Editor, WordCount, DiffViewer |
| `components/toolbar/*` | ActionToolbar, ToneSelector |
| `components/panels/*` | GrammarPanel, ResultPanel |
| `components/layout/*` | Header, Sidebar, Footer |

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `.env.example`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx` (placeholder), `lib/utils.ts`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
cd "c:\Users\Pixel\Documents\Code\AI Writing Assistant"
npx create-next-app@14.2.18 . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```
Expected: Project scaffolded (may prompt to overwrite; confirm for empty dirs)

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install zustand@^4.5.5 framer-motion@^11.11.17 lucide-react@^0.460.0 zod@^3.23.8 clsx@^2.1.1 tailwind-merge@^2.5.4
npm install -D vitest@^2.1.5 @vitejs/plugin-react@^4.3.3
```

- [ ] **Step 3: Add Vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: { environment: "node" },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Create `lib/utils.ts`**

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 5: Create `next.config.js` with security headers**

```javascript
/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://generativelanguage.googleapis.com",
      "img-src 'self' data: blob:",
    ].join("; "),
  },
];

const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
```

- [ ] **Step 6: Create `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-base: #fafafa;
  --bg-surface: #ffffff;
  --bg-overlay: #f4f4f5;
  --bg-hover: #f1f1f3;
  --text-primary: #09090b;
  --text-secondary: #52525b;
  --text-muted: #a1a1aa;
  --text-placeholder: #d4d4d8;
  --border-default: #e4e4e7;
  --border-strong: #d1d1d6;
  --accent: #6366f1;
  --accent-hover: #4f46e5;
  --accent-light: #eef2ff;
  --accent-text: #4338ca;
  --success: #10b981;
  --success-light: #ecfdf5;
  --warning: #f59e0b;
  --danger: #ef4444;
  --danger-light: #fef2f2;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  --bg-base: #09090b;
  --bg-surface: #111113;
  --bg-overlay: #18181b;
  --bg-hover: #27272a;
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #52525b;
  --text-placeholder: #3f3f46;
  --border-default: #27272a;
  --border-strong: #3f3f46;
  --accent-light: #1e1b4b;
  --accent-text: #a5b4fc;
  --success-light: #052e16;
  --danger-light: #450a0a;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.5);
}

@layer base {
  body {
    background-color: var(--bg-base);
    color: var(--text-primary);
    font-family: var(--font-sans), system-ui, sans-serif;
  }
}
```

- [ ] **Step 7: Create `tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        overlay: "var(--bg-overlay)",
        hover: "var(--bg-hover)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-light": "var(--accent-light)",
        border: "var(--border-default)",
        danger: "var(--danger)",
        success: "var(--success)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 8: Create `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Writeflow — AI Writing Assistant",
  description: "Distraction-free AI writing tool",
};

const themeScript = `
(function() {
  try {
    var saved = localStorage.getItem('theme');
    var preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', saved || preferred);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 9: Create placeholder `app/page.tsx`**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-secondary">Writeflow loading...</p>
    </main>
  );
}
```

- [ ] **Step 10: Create `.env.example`**

```
# Get your free API key at: https://aistudio.google.com
GEMINI_API_KEY=your_key_here
```

- [ ] **Step 11: Verify dev server starts**

Run: `npm run dev`
Expected: Server on http://localhost:3000, placeholder page renders

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with security headers and theme system"
```

---

### Task 2: Types

**Files:**
- Create: `types/index.ts`

- [ ] **Step 1: Create `types/index.ts`**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add types/index.ts
git commit -m "feat: add shared TypeScript types"
```

---

### Task 3: Validations and Rate Limiter

**Files:**
- Create: `lib/validations.ts`, `lib/rateLimiter.ts`, `lib/__tests__/rateLimiter.test.ts`

- [ ] **Step 1: Write failing rate limiter test**

Create `lib/__tests__/rateLimiter.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkRateLimit, resetRateLimiter } from "@/lib/rateLimiter";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimiter();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests under the limit", () => {
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit("1.2.3.4").allowed).toBe(true);
    }
  });

  it("blocks the 21st request within the window", () => {
    for (let i = 0; i < 20; i++) checkRateLimit("1.2.3.4");
    const result = checkRateLimit("1.2.3.4");
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("allows requests after window expires", () => {
    for (let i = 0; i < 20; i++) checkRateLimit("1.2.3.4");
    vi.advanceTimersByTime(61_000);
    expect(checkRateLimit("1.2.3.4").allowed).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/__tests__/rateLimiter.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement `lib/rateLimiter.ts`**

```typescript
const store = new Map<string, number[]>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 20;

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const timestamps = (store.get(ip) || []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  timestamps.push(now);
  store.set(ip, timestamps);

  if (store.size > 10000) {
    for (const [key, val] of store.entries()) {
      if (val.every((t) => now - t > WINDOW_MS)) store.delete(key);
    }
  }

  return { allowed: true };
}

export function resetRateLimiter(): void {
  store.clear();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/__tests__/rateLimiter.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Create `lib/validations.ts`**

```typescript
import { z } from "zod";

export const aiActionSchema = z.enum([
  "improve",
  "grammar",
  "summarize",
  "expand",
  "rewrite",
  "rephrase",
]);

export const toneSchema = z.enum([
  "professional",
  "casual",
  "friendly",
  "persuasive",
  "academic",
  "creative",
]);

export const requestSchema = z.object({
  action: aiActionSchema,
  text: z.string().min(10, "Text too short").max(10000, "Text too long (max 10,000 characters)").trim(),
  tone: toneSchema.optional(),
});

export const grammarIssueSchema = z.object({
  id: z.string(),
  type: z.enum(["grammar", "spelling", "style", "punctuation"]),
  original: z.string(),
  suggestion: z.string(),
  explanation: z.string(),
});

export type AiRequest = z.infer<typeof requestSchema>;
```

- [ ] **Step 6: Commit**

```bash
git add lib/validations.ts lib/rateLimiter.ts lib/__tests__/rateLimiter.test.ts vitest.config.ts package.json
git commit -m "feat: add Zod validations and sliding-window rate limiter"
```

---

### Task 4: Gemini Client

**Files:**
- Create: `lib/gemini.ts`

- [ ] **Step 1: Create `lib/gemini.ts`**

```typescript
import type { Tone } from "@/types";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export const SYSTEM_PROMPTS = {
  improve: `You are a world-class editor who has worked with bestselling authors and top publications. Your job is to improve the user's writing to make it clearer, more engaging, and more powerful — without changing their voice or meaning. Fix awkward phrasing, passive voice, redundancy, and weak word choices. Return ONLY the improved text. No explanations, no preamble, no quotation marks.`,

  grammar: `You are a precise grammar and style expert. Analyze the text and find all grammar, spelling, punctuation, and style issues. Return ONLY a valid JSON array. Each object must have exactly these fields:
  {
    "id": "unique string id",
    "type": "grammar" | "spelling" | "style" | "punctuation",
    "original": "the exact problematic phrase from the text",
    "suggestion": "the corrected version",
    "explanation": "one sentence explaining why this is an issue"
  }
  If no issues, return an empty array []. Return ONLY the JSON. No markdown, no code fences, no extra text.`,

  summarize: `You are an expert at distilling complex ideas into their essence. Summarize the following text in exactly 3 sentences. The summary should capture the most important point, a key supporting detail, and the conclusion or implication. Return ONLY the 3-sentence summary. No labels, no preamble.`,

  expand: `You are a skilled writer who can develop ideas with depth and nuance. Expand the following text by adding relevant context, examples, supporting details, and smoother transitions. Aim to roughly double the length while keeping the same voice, tone, and core message. Return ONLY the expanded text.`,

  rewrite: (tone: Tone) =>
    `You are a versatile writer who can adapt any text to a specific tone and style. Rewrite the following text in a ${tone} tone. Keep the exact same meaning and information, but adjust the language, sentence structure, vocabulary, and energy to perfectly match the ${tone} tone. Return ONLY the rewritten text. No explanations.`,

  rephrase: `You are a paraphrasing expert. Rephrase the following text using completely different words and sentence structures while preserving the exact same meaning. The result should read naturally, not like a thesaurus was consulted. Return ONLY the rephrased text.`,
};

export async function callGemini(prompt: string, systemInstruction: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          stopSequences: [],
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response from AI");
    return text.trim();
  } finally {
    clearTimeout(timeout);
  }
}

export function stripQuotes(text: string): string {
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    return text.slice(1, -1);
  }
  return text;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/gemini.ts
git commit -m "feat: add Gemini REST client and system prompts"
```

---

### Task 5: Grammar Parser and Diff

**Files:**
- Create: `lib/grammarParser.ts`, `lib/diff.ts`, `lib/__tests__/grammarParser.test.ts`, `lib/__tests__/diff.test.ts`

- [ ] **Step 1: Write failing grammar parser test**

Create `lib/__tests__/grammarParser.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { parseGrammarResponse } from "@/lib/grammarParser";

describe("parseGrammarResponse", () => {
  it("parses valid JSON array", () => {
    const raw = `[{"id":"1","type":"grammar","original":"teh","suggestion":"the","explanation":"Misspelling"}]`;
    const result = parseGrammarResponse(raw);
    expect(result).toHaveLength(1);
    expect(result[0].suggestion).toBe("the");
  });

  it("strips markdown fences", () => {
    const raw = '```json\n[{"id":"1","type":"spelling","original":"a","suggestion":"b","explanation":"x"}]\n```';
    expect(parseGrammarResponse(raw)).toHaveLength(1);
  });

  it("returns empty array on invalid JSON", () => {
    expect(parseGrammarResponse("not json")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- lib/__tests__/grammarParser.test.ts`

- [ ] **Step 3: Implement `lib/grammarParser.ts`**

```typescript
import { grammarIssueSchema } from "@/lib/validations";
import type { GrammarIssue } from "@/types";

export function parseGrammarResponse(raw: string): GrammarIssue[] {
  try {
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    const issues: GrammarIssue[] = [];
    for (const item of parsed) {
      const result = grammarIssueSchema.safeParse(item);
      if (result.success) issues.push(result.data);
    }
    return issues;
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Write failing diff test**

Create `lib/__tests__/diff.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { wordDiff } from "@/lib/diff";

describe("wordDiff", () => {
  it("marks removed and added words", () => {
    const result = wordDiff("hello world", "hello there");
    expect(result.some((p) => p.type === "removed" && p.text === "world")).toBe(true);
    expect(result.some((p) => p.type === "added" && p.text === "there")).toBe(true);
  });
});
```

- [ ] **Step 5: Implement `lib/diff.ts`**

```typescript
export type DiffPart = { type: "same" | "added" | "removed"; text: string };

export function wordDiff(original: string, revised: string): DiffPart[] {
  const a = original.split(/\s+/).filter(Boolean);
  const b = revised.split(/\s+/).filter(Boolean);
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const parts: DiffPart[] = [];
  let i = m;
  let j = n;
  const stack: DiffPart[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      stack.push({ type: "same", text: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: "added", text: b[j - 1] });
      j--;
    } else {
      stack.push({ type: "removed", text: a[i - 1] });
      i--;
    }
  }

  stack.reverse().forEach((p) => parts.push(p));
  return parts;
}
```

- [ ] **Step 6: Run all lib tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add lib/grammarParser.ts lib/diff.ts lib/__tests__
git commit -m "feat: add grammar JSON parser and word-level diff"
```

---

### Task 6: Storage Layer

**Files:**
- Create: `lib/storage.ts`, `lib/__tests__/storage.test.ts`

- [ ] **Step 1: Write storage tests (using mock localStorage)**

Create `lib/__tests__/storage.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from "vitest";
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
    setItem: (k: string, v: string) => { mockStore[k] = v; },
    removeItem: (k: string) => { delete mockStore[k]; },
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
```

Add `import { vi } from "vitest";` at top.

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- lib/__tests__/storage.test.ts`

- [ ] **Step 3: Implement `lib/storage.ts`**

```typescript
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
```

Note: `crypto.randomUUID()` in Node tests requires vitest environment or polyfill. Add to vitest.config.ts:
```typescript
test: { environment: "jsdom" },
```
And install: `npm install -D jsdom@^25.0.1`

- [ ] **Step 4: Run tests — expect PASS**

Run: `npm test -- lib/__tests__/storage.test.ts`

- [ ] **Step 5: Commit**

```bash
git add lib/storage.ts lib/__tests__/storage.test.ts vitest.config.ts package.json
git commit -m "feat: add localStorage draft and snapshot persistence"
```

---

### Task 7: Markdown Export and Animations

**Files:**
- Create: `lib/markdown.ts`, `lib/animations.ts`

- [ ] **Step 1: Create `lib/markdown.ts`**

```typescript
export function toMarkdown(text: string, title: string): string {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  const body = paragraphs.map((p) => p.trim()).join("\n\n");
  return `# ${title}\n\n${body}\n`;
}

export function toPlainText(text: string): string {
  return text.trim();
}

export function toHtml(text: string, title: string): string {
  const paragraphs = text
    .split(/\n\n+/)
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
    .join("\n");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body>${paragraphs}</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: Create `lib/animations.ts`**

```typescript
export const ANIMATIONS = {
  panelSlideIn: {
    initial: { x: 340, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 340, opacity: 0 },
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
  toolbarFadeUp: {
    initial: { y: 8, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 8, opacity: 0 },
    transition: { duration: 0.15, ease: "easeOut" as const },
  },
  toastSlideIn: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
    transition: { type: "spring" as const, stiffness: 400, damping: 35 },
  },
  bottomSheetSlideUp: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    transition: { type: "spring" as const, stiffness: 300, damping: 35 },
  },
};

export const REDUCED_MOTION_TRANSITION = { duration: 0 };
```

- [ ] **Step 3: Commit**

```bash
git add lib/markdown.ts lib/animations.ts
git commit -m "feat: add markdown export helpers and animation presets"
```

---

### Task 8: API Route

**Files:**
- Create: `app/api/ai/route.ts`

- [ ] **Step 1: Create `app/api/ai/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { callGemini, stripQuotes, SYSTEM_PROMPTS } from "@/lib/gemini";
import { parseGrammarResponse } from "@/lib/grammarParser";
import { checkRateLimit } from "@/lib/rateLimiter";
import { requestSchema } from "@/lib/validations";
import type { Tone } from "@/types";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function logError(action: string, textLength: number, errorType: string) {
  console.error(JSON.stringify({ action, textLength, errorType, timestamp: Date.now() }));
}

export async function POST(request: NextRequest) {
  let action = "unknown";
  let textLength = 0;

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message || "Validation failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    action = parsed.data.action;
    textLength = parsed.data.text.length;

    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter ?? 60) } }
      );
    }

    const { text, tone } = parsed.data;
    let systemInstruction: string;

    switch (action) {
      case "improve":
        systemInstruction = SYSTEM_PROMPTS.improve;
        break;
      case "grammar":
        systemInstruction = SYSTEM_PROMPTS.grammar;
        break;
      case "summarize":
        systemInstruction = SYSTEM_PROMPTS.summarize;
        break;
      case "expand":
        systemInstruction = SYSTEM_PROMPTS.expand;
        break;
      case "rewrite":
        systemInstruction = SYSTEM_PROMPTS.rewrite((tone ?? "professional") as Tone);
        break;
      case "rephrase":
        systemInstruction = SYSTEM_PROMPTS.rephrase;
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const raw = await callGemini(text, systemInstruction);

    if (action === "grammar") {
      const issues = parseGrammarResponse(raw);
      return NextResponse.json({ result: issues });
    }

    return NextResponse.json({ result: stripQuotes(raw) });
  } catch (err) {
    const errorType =
      err instanceof Error && err.name === "AbortError"
        ? "timeout"
        : err instanceof Error && err.message.includes("Gemini")
          ? "gemini_error"
          : err instanceof Error && err.message.includes("Empty")
            ? "empty_response"
            : "unknown";

    logError(action, textLength, errorType);

    if (errorType === "timeout") {
      return NextResponse.json({ error: "Request timed out. Try again." }, { status: 504 });
    }
    if (errorType === "gemini_error" || errorType === "empty_response") {
      return NextResponse.json(
        { error: errorType === "empty_response" ? "No response from AI. Try rephrasing." : "AI service unavailable. Try again." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
```

- [ ] **Step 2: Manual verify**

Run: `npm run dev`
Test with curl (requires `.env.local` with valid key):
```bash
curl -X POST http://localhost:3000/api/ai -H "Content-Type: application/json" -d "{\"action\":\"improve\",\"text\":\"This is a test sentence that needs improvement.\"}"
```
Expected: `{ "result": "..." }` or 502 if no key configured

- [ ] **Step 3: Commit**

```bash
git add app/api/ai/route.ts
git commit -m "feat: add validated and rate-limited AI API route"
```

---

### Task 9: Zustand Store

**Files:**
- Create: `store/editorStore.ts`

- [ ] **Step 1: Create `store/editorStore.ts`**

Implement full store with:
- `text`, `documentTitle`, `selection`, `selectedTone`, `isLoading`, `loadingAction`
- `aiResult`, `grammarIssues`, `activePanel`, `snapshots`, `showDiff`
- `lastAiUsedSelection: boolean` (track scope for apply)
- Actions: `setText`, `setDocumentTitle`, `setSelection`, `setSelectedTone`, `setLoading`
- `getAiTargetText()`, `runAiAction(action)` (delegates to api.ts in Task 10)
- `applyResult()`, `discardResult()`, `applyGrammarFix(id)`, `applyAllGrammarFixes()`
- `loadDraftById`, `createSnapshot`, `deleteSnapshot`
- `hydrateFromStorage()` called on mount

Key apply logic:
```typescript
applyResult: () => {
  const { aiResult, text, selection, lastAiUsedSelection } = get();
  if (!aiResult) return;
  if (lastAiUsedSelection && selection) {
    const newText = text.slice(0, selection.start) + aiResult + text.slice(selection.end);
    set({ text: newText, aiResult: null, activePanel: null, selection: null });
  } else {
    set({ text: aiResult, aiResult: null, activePanel: null });
  }
},
```

Grammar apply-all: sort issues by `text.indexOf(original)` descending, replace first occurrence each.

- [ ] **Step 2: Commit**

```bash
git add store/editorStore.ts
git commit -m "feat: add Zustand editor store with AI and draft actions"
```

---

### Task 10: Client API Helper and Hooks

**Files:**
- Create: `lib/api.ts`, `hooks/useAutoSave.ts`, `hooks/useEditorStats.ts`, `hooks/useKeyboardShortcuts.ts`, `hooks/useReducedMotion.ts`

- [ ] **Step 1: Create `lib/api.ts`**

```typescript
import type { AiAction, GrammarIssue, Tone } from "@/types";

interface AiSuccess {
  result: string | GrammarIssue[];
}

export async function callAiApi(
  action: AiAction,
  text: string,
  tone?: Tone
): Promise<AiSuccess> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, text, tone }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data as AiSuccess;
}
```

Wire `runAiAction` in store to use `callAiApi`, set `lastAiUsedSelection`, handle grammar vs text results.

- [ ] **Step 2: Create hooks**

`useAutoSave.ts`: debounce 2000ms, call `saveCurrentDraft(text, documentTitle)` on change.

`useEditorStats.ts`: return `{ words, chars, readingTime }` from text.

`useReducedMotion.ts`: `matchMedia("(prefers-reduced-motion: reduce)")`.

`useKeyboardShortcuts.ts`: bind all shortcuts from spec; accept callbacks from page.

- [ ] **Step 3: Commit**

```bash
git add lib/api.ts hooks/
git commit -m "feat: add client API helper and editor hooks"
```

---

### Task 11: UI Primitives

**Files:**
- Create: `components/ui/Button.tsx`, `Spinner.tsx`, `Tooltip.tsx`, `ThemeToggle.tsx`, `Toast.tsx`

- [ ] **Step 1: Button**

Variants: `primary`, `ghost`, `danger`. Props: `disabled`, `loading`, `className`, `aria-label`.

- [ ] **Step 2: Spinner**

SVG animate-spin, sizes `sm` | `md`.

- [ ] **Step 3: Tooltip**

Wrapper with `title` + optional shortcut hint on hover.

- [ ] **Step 4: ThemeToggle**

Toggle `data-theme`, sync `localStorage.theme`, dispatch custom event.

- [ ] **Step 5: Toast**

Zustand toast slice or separate `useToastStore`. Max 3 stacked bottom-right. Auto-dismiss 4s. Framer Motion `toastSlideIn`.

- [ ] **Step 6: Verify** — import in placeholder page temporarily, confirm render

- [ ] **Step 7: Commit**

```bash
git add components/ui/
git commit -m "feat: add UI primitives (Button, Toast, Spinner, Tooltip, ThemeToggle)"
```

---

### Task 12: Command Palette and Shortcuts Modal

**Files:**
- Create: `components/ui/CommandPalette.tsx`, `components/ui/ShortcutsModal.tsx`

- [ ] **Step 1: CommandPalette**

- Props: `open`, `onClose`, `onCommand(id: string)`
- Commands array with `{ id, label, group, keywords, shortcut? }`
- Filter input, arrow key nav, Enter to execute, focus trap
- Groups: AI Actions, Document, View, Navigation

- [ ] **Step 2: ShortcutsModal**

- Two-column grid of all shortcuts from spec
- Opens on `?`, closes on Esc

- [ ] **Step 3: Commit**

```bash
git add components/ui/CommandPalette.tsx components/ui/ShortcutsModal.tsx
git commit -m "feat: add command palette and keyboard shortcuts modal"
```

---

### Task 13: Editor Components

**Files:**
- Create: `components/editor/Editor.tsx`, `WordCount.tsx`, `DiffViewer.tsx`

- [ ] **Step 1: Editor.tsx**

- Controlled textarea bound to store `text`
- Auto-resize via `useEffect` on text change
- Track selection on `onSelect`, `onKeyUp`, `onMouseUp`
- `aria-label="Document editor"`
- Placeholder: "Start writing, or press ⌘K for commands..."

- [ ] **Step 2: WordCount.tsx**

- Display words, chars, reading time (words/200 min)

- [ ] **Step 3: DiffViewer.tsx**

- Use `wordDiff()` from lib/diff
- Side-by-side: original vs result
- Styling: removed = strikethrough danger, added = success color

- [ ] **Step 4: Commit**

```bash
git add components/editor/
git commit -m "feat: add Editor, WordCount, and DiffViewer components"
```

---

### Task 14: Toolbar Components

**Files:**
- Create: `components/toolbar/ActionToolbar.tsx`, `components/toolbar/ToneSelector.tsx`

- [ ] **Step 1: ActionToolbar**

- Floating pill bar with AI action buttons (icon + label)
- Disabled when `isLoading`
- Framer Motion enter/exit
- Visible when selection active OR text.length >= 10 (desktop)
- Each button calls `runAiAction`

- [ ] **Step 2: ToneSelector**

- 6 tone pills, selected state uses accent background
- Horizontal scroll on mobile

- [ ] **Step 3: Commit**

```bash
git add components/toolbar/
git commit -m "feat: add ActionToolbar and ToneSelector"
```

---

### Task 15: Panel Components

**Files:**
- Create: `components/panels/GrammarPanel.tsx`, `components/panels/ResultPanel.tsx`

- [ ] **Step 1: GrammarPanel**

- Header with issue count badge + close
- Issue cards: type badge, strikethrough original, green suggestion, Apply button
- Apply All sticky footer
- Empty state with checkmark
- Loading: 3 skeleton cards
- `aria-live="polite"` for loading

- [ ] **Step 2: ResultPanel**

- Read-only preview of `aiResult`
- Replace (primary) + Discard (ghost)
- "Show changes" toggles DiffViewer
- Error state with Retry button

- [ ] **Step 3: Commit**

```bash
git add components/panels/
git commit -m "feat: add GrammarPanel and ResultPanel"
```

---

### Task 16: Layout Components

**Files:**
- Create: `components/layout/Header.tsx`, `Sidebar.tsx`, `Footer.tsx`, `components/ui/ExportMenu.tsx`

- [ ] **Step 1: Header**

- 52px fixed top, logo (Pencil icon) + "Writeflow"
- Inline editable document title
- Word count chip, selection indicator
- ExportMenu + ThemeToggle

- [ ] **Step 2: Sidebar**

- 240px collapsible to 48px icon rail
- Current draft pinned with "Auto-saved" label
- Snapshot list with preview, delete on hover
- Calls `loadDraftById` on click

- [ ] **Step 3: Footer**

- Privacy notice text from spec
- WordCount detail

- [ ] **Step 4: ExportMenu**

- Dropdown: Export .md, Copy Markdown, Copy Plain Text, Copy HTML
- Uses `lib/markdown.ts` helpers
- "Copied!" feedback

- [ ] **Step 5: Commit**

```bash
git add components/layout/ components/ui/ExportMenu.tsx
git commit -m "feat: add Header, Sidebar, Footer, and ExportMenu"
```

---

### Task 17: Main Page Assembly

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Create client page `"use client"`**

Assemble:
- `hydrateFromStorage()` on mount via `useEffect`
- `useAutoSave(text, documentTitle)`
- `useKeyboardShortcuts({ ... })`
- Layout: Header + flex row (Sidebar | Editor column | Panel)
- Conditional GrammarPanel or ResultPanel with AnimatePresence
- CommandPalette, ShortcutsModal
- Toast container
- Mobile: FAB (Wand2 icon) opens action sheet; bottom sheet panel
- `aria-live` region for AI loading

- [ ] **Step 2: Verify full flow manually**

Run: `npm run dev`
Checklist:
- Type text, auto-save survives refresh
- ⌘K opens palette
- AI action opens result panel (with valid API key)
- Theme toggle works, no flash
- Mobile 375px layout usable

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble main Writeflow editor page"
```

---

### Task 18: Production Build and QA

**Files:**
- Modify: none (verification only)

- [ ] **Step 1: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run all unit tests**

Run: `npm test`
Expected: All PASS

- [ ] **Step 3: Security verification**

- DevTools Network: `/api/ai` requests have no API key in URL from browser
- Response headers include CSP, X-Frame-Options
- Send 21 rapid requests: 21st returns 429

- [ ] **Step 4: Complete quality checklist**

Mark all items in spec Section 14.

- [ ] **Step 5: Final commit if any fixes**

```bash
git add -A
git commit -m "chore: production build verification and QA fixes"
```

---

## Spec Coverage Matrix

| Spec Section | Task |
|-------------|------|
| Tech stack | Task 1 |
| Types / data model | Task 2, 9 |
| Smart selection scope | Task 9, 13 |
| Command palette | Task 12 |
| Draft history / snapshots | Task 6, 9, 16 |
| API route + errors | Task 8 |
| Rate limiting | Task 3, 8 |
| Security headers | Task 1 |
| Gemini prompts | Task 4 |
| Grammar JSON fallback | Task 5, 8 |
| UI layout + responsive | Task 17 |
| Keyboard shortcuts | Task 10, 12 |
| Export | Task 7, 16 |
| DiffViewer | Task 5, 13, 15 |
| Animations + reduced motion | Task 7, 11+ |
| Accessibility | Tasks 11-17 |
| Quality checklist | Task 18 |

---

## Self-Review Notes

- All tasks include exact file paths and code for lib/server layers
- UI component tasks specify behavior/props; implementer fills JSX following design spec CSS variables
- Vitest + jsdom added for pure function coverage; UI verified manually per spec
- `resetRateLimiter` export added for testability only
- `.env.example` uses placeholder key only
- No TBD or TODO placeholders remain
