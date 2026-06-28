# Writeflow — AI Writing Assistant Design Spec

**Date:** 2026-06-28  
**Status:** Approved  
**Approach:** Spec-faithful single store (Approach 1)

---

## 1. Product Vision

Writeflow is a distraction-free AI writing tool for founders, content writers, students, and non-native English speakers. Users open it, write, and access professional AI editing at one keystroke. No clutter, no accounts, no server-side storage.

**Brand:** Writeflow (pencil icon + wordmark in header)

---

## 2. Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + CSS variables |
| AI | Google Gemini 1.5 Flash (REST, no SDK) |
| State | Zustand |
| Animations | Framer Motion |
| Icons | Lucide React |
| Font | Inter (next/font/google) |
| Validation | Zod |
| Deploy | Vercel |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Client)                                           │
│  ┌──────────┬────────────────────────────┬───────────────┐  │
│  │ Sidebar  │  Editor + Toolbar          │  AI Panel     │  │
│  │ (drafts) │  (textarea, selection)     │  Grammar/     │  │
│  │          │                            │  Result       │  │
│  └──────────┴────────────────────────────┴───────────────┘  │
│  Command Palette (⌘K) · Toast · Theme · Export              │
│  Zustand store + localStorage (drafts, theme, auto-save)    │
└──────────────────────────┬──────────────────────────────────┘
                           │ POST /api/ai (validated, rate-limited)
┌──────────────────────────▼──────────────────────────────────┐
│  Next.js Server                                             │
│  Zod validate → rate limit by IP → Gemini REST → safe JSON  │
│  GEMINI_API_KEY never leaves server                         │
└─────────────────────────────────────────────────────────────┘
```

### AI Action Flow

1. User selects text (optional) and triggers action via toolbar, shortcut, or command palette.
2. Client resolves scope: **selection if present, else full document** (smart default).
3. `POST /api/ai` with `{ action, text, tone? }`.
4. Server validates, rate-limits, calls Gemini, returns result.
5. Grammar or Result panel opens; user applies, discards, or fixes issues.

---

## 4. Product Decisions (Brainstorming Outcomes)

| Decision | Choice |
|----------|--------|
| AI text scope | Smart default: selection if exists, else full document |
| ⌘K behavior | Full command palette (search, filter all actions) |
| Sidebar v1 | Functional localStorage draft history |
| History entries | Auto-save current draft + explicit snapshots (⌘S) |
| Switching drafts | Auto-save current draft first, then switch silently |
| Snapshot limit | Max 50; oldest pruned on overflow |

---

## 5. Data Model

### Types (`/types/index.ts`)

```typescript
type AiAction = "improve" | "grammar" | "summarize" | "expand" | "rewrite" | "rephrase";
type Tone = "professional" | "casual" | "friendly" | "persuasive" | "academic" | "creative";
type GrammarIssueType = "grammar" | "spelling" | "style" | "punctuation";
type ActivePanel = "grammar" | "result" | null;

interface GrammarIssue {
  id: string;
  type: GrammarIssueType;
  original: string;
  suggestion: string;
  explanation: string;
}

interface DraftSnapshot {
  id: string;
  title: string;
  text: string;
  createdAt: number;
  isSnapshot: boolean; // false = auto-save current draft slot
}

interface EditorSelection {
  start: number;
  end: number;
  text: string;
}

interface StorageSchema {
  version: 1;
  currentDraftId: string;
  currentDraft: DraftSnapshot;
  snapshots: DraftSnapshot[];
  theme: "light" | "dark" | null;
}
```

### localStorage

| Key | Purpose |
|-----|---------|
| `writeflow:v1` | Full `StorageSchema` JSON |
| `theme` | Read by inline theme script in layout.tsx |

### Storage Helpers (`/lib/storage.ts`)

- `loadStorage()` — defaults if missing or corrupt
- `saveCurrentDraft(text, title)` — debounced auto-save (2s)
- `createSnapshot(title?)` — ⌘S; defaults to `"Snapshot {date}"`
- `loadDraft(id)` — by id (current or snapshot)
- `deleteSnapshot(id)` — remove from list
- `listSidebarItems()` — current draft + snapshots, sorted by `createdAt` desc
- `pruneSnapshots(max = 50)` — drop oldest on overflow
- All helpers: try/catch; on `QuotaExceededError`, prune and retry once

### Zustand Store Extensions

Beyond base editor state:

```typescript
selection: EditorSelection | null;
snapshots: DraftSnapshot[];
loadDraftById(id: string): void;   // auto-save first, then switch
createSnapshot(title?: string): void;
deleteSnapshot(id: string): void;
getAiTargetText(): string;          // selection.text || store.text
```

### Selection Handling

1. Textarea tracks `onSelect`, `onKeyUp`, `onMouseUp` for `{ start, end, text }`.
2. `getAiTargetText()` returns selection when `start !== end`, else full document.
3. **Apply result:** replace `[start, end)` if scoped to selection; else replace entire document.
4. **Grammar fixes:** replace first occurrence of `original` with `suggestion`. "Apply All" processes in reverse document order.
5. Validate minimum 10 chars on resolved target before API call.

---

## 6. Command Palette (⌘K)

Component: `/components/ui/CommandPalette.tsx`

| Group | Commands |
|-------|----------|
| AI Actions | Improve, Grammar, Summarize, Expand, Rewrite, Rephrase |
| Tone | 6 tones as secondary step for Rewrite |
| Document | Save Snapshot (⌘S), Export submenu trigger |
| View | Toggle Theme, Toggle Diff, Keyboard Shortcuts (?) |
| Navigation | Open Grammar Panel, Close Panel (Esc) |

- Centered modal, max-width 560px, backdrop blur
- Fuzzy filter by label + keywords
- Arrow keys navigate; Enter executes; Esc closes
- Focus trap, `role="dialog"`, `aria-modal="true"`

### Shortcuts Modal (?)

Component: `/components/ui/ShortcutsModal.tsx`  
Two-column grid of all shortcuts. Same overlay pattern as palette.

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘/Ctrl + K | Open command palette |
| ⌘/Ctrl + I | Improve Writing |
| ⌘/Ctrl + G | Grammar Check |
| ⌘/Ctrl + J | Summarize |
| ⌘/Ctrl + E | Expand |
| ⌘/Ctrl + R | Rewrite with current tone |
| ⌘/Ctrl + D | Toggle dark/light mode |
| ⌘/Ctrl + S | Save snapshot |
| Escape | Close any open panel/modal |
| ? | Open shortcuts cheatsheet |

---

## 7. API Route

### Flow (`/app/api/ai/route.ts`)

```
POST /api/ai
  → Parse JSON (400 if invalid)
  → Zod validate (400 + field errors)
  → Extract IP (x-forwarded-for || x-real-ip || "unknown")
  → checkRateLimit(ip) → 429 if exceeded
  → Build system prompt from action (+ tone for rewrite)
  → callGemini(userText, systemPrompt)
  → Post-process by action type
  → Return { result: string | GrammarIssue[] }
```

### Request Schema

```typescript
const requestSchema = z.object({
  action: z.enum(["improve", "grammar", "summarize", "expand", "rewrite", "rephrase"]),
  text: z.string().min(10).max(10000).trim(),
  tone: z.enum(["professional", "casual", "friendly", "persuasive", "academic", "creative"]).optional(),
});
```

### Error Handling

| Scenario | HTTP | Client message |
|----------|------|----------------|
| Invalid body / Zod | 400 | Validation message |
| Rate limit | 429 | "Too many requests. Please wait a moment." |
| Gemini error | 502 | "AI service unavailable. Try again." |
| Empty/blocked response | 502 | "No response from AI. Try rephrasing." |
| Timeout (8s) | 504 | "Request timed out. Try again." |
| Unknown | 500 | "Something went wrong. Try again." |

**Logging:** Never log text content. Log `{ action, textLength, errorType, timestamp }`.

### Grammar Post-Processing

1. Strip markdown code fences if present.
2. `JSON.parse()` in try/catch.
3. Validate each item with Zod `GrammarIssue` schema.
4. On total failure: return `{ result: [] }`, log `grammar_parse_failed`.

### Rate Limiter

In-memory sliding window: 20 requests/IP/minute. `Retry-After` header on 429.  
**v1 caveat:** Resets on cold starts; not shared across Vercel instances. Redis upgrade deferred.

### Client API Helper (`/lib/api.ts`)

Thin fetch wrapper: sets loading state, handles errors with retry callback, never exposes API key.

---

## 8. Security

### API Security

- `GEMINI_API_KEY` server-side only
- All AI calls through `/api/ai`
- Rate limiting on `/api/ai`
- Zod validation on all requests

### HTTP Security Headers (next.config.js)

```
X-DNS-Prefetch-Control: on
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://generativelanguage.googleapis.com; img-src 'self' data: blob:
```

### Data Privacy

- No server-side user data storage
- Drafts in localStorage only
- Footer: "Your text never leaves your device except when using AI features."
- AI requests send only resolved target text

### Environment

- `.env.local`: `GEMINI_API_KEY=` (user-provided)
- `.env.example`: `GEMINI_API_KEY=your_key_here` (placeholder only, never real keys)

---

## 9. UI Layout

### Desktop (>1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│ Header (52px): Logo | Editable Title | Stats | Export | Theme │
├──────────┬──────────────────────────────────────┬───────────────┤
│ Sidebar  │         Editor Area                  │  AI Panel     │
│ 240px    │  centered textarea max-w-[720px]     │  340px        │
│          │  floating ActionToolbar (bottom)     │  Grammar OR   │
│          │  ToneSelector (below toolbar)        │  Result       │
├──────────┴──────────────────────────────────────┴───────────────┤
│ Footer: privacy notice + word count detail                      │
└─────────────────────────────────────────────────────────────────┘
```

### Sidebar

- Collapsible to 48px icon rail
- Current draft pinned top ("Auto-saved" label)
- Snapshots: title, relative time, 60-char preview
- Delete icon on hover (snapshots only)
- Empty state: "Press ⌘S to save a snapshot"

### Editor

- Plain textarea, auto-resize
- Placeholder: "Start writing, or press ⌘K for commands..."
- Header shows "N words selected" when selection active

### Toolbar

- Visible when text selected OR typed ≥10 chars (desktop)
- Floating pill bar, Framer Motion fade-up
- Mobile (<768px): hidden; FAB (magic wand) opens action sheet

### AI Panel (340px)

- GrammarPanel or ResultPanel (mutually exclusive)
- ResultPanel: Replace / Discard, optional DiffViewer toggle
- GrammarPanel: issue cards, Apply / Apply All

### Responsive

| Viewport | Behavior |
|----------|----------|
| >1024px | Three-column layout |
| 768–1024px | Sidebar icon rail; AI panel as right overlay sheet |
| <768px | Drafts via header menu; AI panel as bottom sheet (70vh); FAB for actions |

---

## 10. Design System

CSS variables in `globals.css` for light/dark themes (see original spec palette). All components use variables only; no hardcoded hex.

Typography: Inter variable font. Editor default 15px / line-height 1.8.

Animations in `/lib/animations.ts`. Respect `prefers-reduced-motion: reduce` (instant transitions).

---

## 11. AI System Prompts

Defined in `/lib/gemini.ts` as `SYSTEM_PROMPTS` constants (improve, grammar, summarize, expand, rewrite, rephrase). Grammar returns JSON array only.

Gemini endpoint: `gemini-1.5-flash:generateContent` via REST. Temperature 0.7, maxOutputTokens 2048. Safety settings block medium+ across all categories.

---

## 12. File Structure

```
/app
  layout.tsx
  page.tsx
  globals.css
  /api/ai/route.ts
/components
  /editor       Editor, WordCount, DiffViewer
  /toolbar      ActionToolbar, ToneSelector
  /panels       GrammarPanel, ResultPanel
  /ui           Button, Toast, Spinner, Tooltip, ThemeToggle,
                ExportMenu, CommandPalette, ShortcutsModal
  /layout       Header, Sidebar, Footer
/lib
  gemini.ts, rateLimiter.ts, validations.ts, storage.ts,
  markdown.ts, api.ts, animations.ts, diff.ts
/store
  editorStore.ts
/hooks
  useAutoSave.ts, useKeyboardShortcuts.ts, useEditorStats.ts
/types
  index.ts
next.config.js
.env.example
```

---

## 13. Implementation Order

1. Project scaffold (next.config, tailwind, globals.css, layout.tsx)
2. Types
3. Lib layer
4. API route
5. Zustand store
6. Hooks
7. UI primitives
8. Command palette + shortcuts modal
9. Editor components
10. Toolbar components
11. Panel components
12. Layout components
13. Main page assembly
14. Final QA pass

---

## 14. Quality Checklist

- [ ] API key never in client code or network requests
- [ ] Rate limiting blocks >20 requests/min per IP
- [ ] All inputs validated with Zod
- [ ] Security headers on all responses
- [ ] Grammar handles malformed JSON (empty array fallback)
- [ ] Auto-save restores on refresh
- [ ] All keyboard shortcuts work
- [ ] Dark mode: no hardcoded colors
- [ ] Mobile usable at 375px
- [ ] Loading disables AI buttons
- [ ] Network failure shows friendly error + retry
- [ ] Export .md download and clipboard copy work
- [ ] Draft switch auto-saves first
- [ ] ⌘S snapshot appears in sidebar

---

## 15. Out of Scope (v1)

- User accounts / authentication
- Server-side draft storage
- Redis rate limiting
- Rich-text editor (TipTap/ProseMirror)
- Multi-document tabs
- Real-time collaboration
- Analytics / telemetry

---

## 16. Dependencies

```json
{
  "next": "14.2.x",
  "react": "^18.3.x",
  "react-dom": "^18.3.x",
  "zustand": "^4.5.x",
  "framer-motion": "^11.x",
  "lucide-react": "^0.400.x",
  "zod": "^3.23.x",
  "tailwindcss": "^3.4.x",
  "clsx": "^2.1.x",
  "tailwind-merge": "^2.3.x"
}
```
