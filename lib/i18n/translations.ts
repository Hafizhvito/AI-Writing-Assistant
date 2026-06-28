export type Locale = "en" | "id";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "id", label: "Indonesia" },
];

const en = {
  common: {
    untitled: "Untitled",
    snapshot: "Snapshot",
    apply: "Apply",
    retry: "Retry",
    replace: "Replace",
    discard: "Discard",
    export: "Export",
    copied: "Copied!",
    word: "word",
    words: "words",
    char: "char",
    chars: "chars",
    minRead: "{{n}} min read",
    justNow: "just now",
    minutesAgo: "{{n}}m ago",
    hoursAgo: "{{n}}h ago",
    daysAgo: "{{n}}d ago",
  },
  header: {
    editTitle: "Click to edit title",
    documentTitle: "Document title",
    wordsSelected: "{{n}} {{unit}} selected",
  },
  editor: {
    placeholder: "Start writing...",
    ariaLabel: "Document editor",
  },
  sidebar: {
    drafts: "Drafts",
    autoSaved: "Auto-saved",
    emptySnapshots: "No snapshots saved yet",
    expand: "Expand sidebar",
    collapse: "Collapse sidebar",
    deleteSnapshot: 'Delete snapshot "{{title}}"',
  },
  footer: {
    privacy:
      "Your text never leaves your device except when using AI features.",
  },
  actions: {
    improve: "Improve",
    improveFull: "Improve Writing",
    grammar: "Grammar",
    grammarFull: "Grammar Check",
    summarize: "Summarize",
    expand: "Expand",
    rewrite: "Rewrite",
    rephrase: "Rephrase",
  },
  tones: {
    professional: "Professional",
    casual: "Casual",
    friendly: "Friendly",
    persuasive: "Persuasive",
    academic: "Academic",
    creative: "Creative",
    ariaLabel: "Writing tone",
  },
  grammar: {
    title: "Grammar Check",
    panelLabel: "Grammar Check panel",
    closePanel: "Close Grammar Check panel",
    checking: "Checking grammar, please wait…",
    noIssues: "No issues found.",
    looksGreat: "Your writing looks great.",
    applyAll: "Apply All ({{n}})",
    issuesCount: "{{n}} issues",
    types: {
      grammar: "Grammar",
      spelling: "Spelling",
      style: "Style",
      punctuation: "Punctuation",
    },
  },
  result: {
    title: "AI Result",
    panelLabel: "AI Result panel",
    closePanel: "Close AI Result panel",
    showChanges: "Show changes",
    hideChanges: "Hide changes",
  },
  diff: {
    original: "Original",
    revised: "Revised",
  },
  export: {
    asMd: "Export as .md",
    copyMd: "Copy Markdown",
    copyPlain: "Copy Plain Text",
    copyHtml: "Copy HTML",
  },
  commandPalette: {
    title: "Command Palette",
    search: "Search commands",
    placeholder: "Search commands…",
    groups: {
      ai: "AI Actions",
      document: "Document",
      view: "View",
      navigation: "Navigation",
    },
    saveSnapshot: "Save Snapshot",
    exportDocument: "Export Document",
    toggleTheme: "Toggle Theme",
    toggleDiff: "Toggle Diff View",
    keyboardShortcuts: "Keyboard Shortcuts",
    closePanel: "Close Panel",
    footerNav: "↑↓ navigate",
    footerEnter: "↵ run",
    footerEsc: "Esc close",
    noResults: "No commands found",
  },
  shortcuts: {
    title: "Keyboard Shortcuts",
    close: "Close shortcuts",
    platformNote: "On macOS use ⌘ · On Windows / Linux use Ctrl",
    items: {
      palette: "Open command palette",
      improve: "Improve Writing",
      grammar: "Grammar Check",
      summarize: "Summarize",
      expand: "Expand",
      rewrite: "Rewrite with current tone",
      theme: "Toggle dark / light mode",
      snapshot: "Save snapshot",
      close: "Close any open panel / modal",
      cheatsheet: "Open shortcuts cheatsheet",
    },
  },
  mobile: {
    openAiActions: "Open AI actions",
    aiActions: "AI Actions",
    closeAiActions: "Close AI actions",
  },
  toast: {
    snapshotSaved: "Snapshot saved",
    success: "Success",
    error: "Error",
    info: "Info",
  },
  loading: {
    aiProcessing: "AI is processing your request…",
    ariaLabel: "Loading",
  },
  theme: {
    toggle: "Toggle theme",
  },
  language: {
    toggle: "Change language",
  },
  a11y: {
    dismissNotification: "Dismiss notification",
    notifications: "Notifications",
    aiActions: "AI actions",
    mainEditor: "Document editor",
  },
  errors: {
    textTooShort: "Please write at least 10 characters before using AI.",
    generic: "Something went wrong. Try again.",
  },
};

const id: typeof en = {
  common: {
    untitled: "Tanpa Judul",
    snapshot: "Snapshot",
    apply: "Terapkan",
    retry: "Coba lagi",
    replace: "Ganti teks",
    discard: "Buang",
    export: "Ekspor",
    copied: "Tersalin!",
    word: "kata",
    words: "kata",
    char: "karakter",
    chars: "karakter",
    minRead: "{{n}} mnt baca",
    justNow: "baru saja",
    minutesAgo: "{{n}} mnt lalu",
    hoursAgo: "{{n}} jam lalu",
    daysAgo: "{{n}} hari lalu",
  },
  header: {
    editTitle: "Klik untuk ubah judul",
    documentTitle: "Judul dokumen",
    wordsSelected: "{{n}} {{unit}} dipilih",
  },
  editor: {
    placeholder: "Mulai menulis...",
    ariaLabel: "Editor dokumen",
  },
  sidebar: {
    drafts: "Draf",
    autoSaved: "Tersimpan otomatis",
    emptySnapshots: "Belum ada snapshot tersimpan",
    expand: "Buka sidebar",
    collapse: "Tutup sidebar",
    deleteSnapshot: 'Hapus snapshot "{{title}}"',
  },
  footer: {
    privacy:
      "Teks Anda tidak pernah meninggalkan perangkat kecuali saat menggunakan fitur AI.",
  },
  actions: {
    improve: "Perbaiki",
    improveFull: "Perbaiki Tulisan",
    grammar: "Grammar",
    grammarFull: "Cek Grammar",
    summarize: "Ringkas",
    expand: "Perluas",
    rewrite: "Tulis Ulang",
    rephrase: "Parafrase",
  },
  tones: {
    professional: "Profesional",
    casual: "Santai",
    friendly: "Ramah",
    persuasive: "Persuasif",
    academic: "Akademis",
    creative: "Kreatif",
    ariaLabel: "Nada tulisan",
  },
  grammar: {
    title: "Cek Grammar",
    panelLabel: "Panel cek grammar",
    closePanel: "Tutup panel grammar",
    checking: "Memeriksa grammar, mohon tunggu…",
    noIssues: "Tidak ada masalah.",
    looksGreat: "Tulisan Anda sudah bagus.",
    applyAll: "Terapkan Semua ({{n}})",
    issuesCount: "{{n}} masalah",
    types: {
      grammar: "Grammar",
      spelling: "Ejaan",
      style: "Gaya",
      punctuation: "Tanda baca",
    },
  },
  result: {
    title: "Hasil AI",
    panelLabel: "Panel hasil AI",
    closePanel: "Tutup panel hasil AI",
    showChanges: "Tampilkan perubahan",
    hideChanges: "Sembunyikan perubahan",
  },
  diff: {
    original: "Asli",
    revised: "Revisi",
  },
  export: {
    asMd: "Ekspor sebagai .md",
    copyMd: "Salin Markdown",
    copyPlain: "Salin Teks Biasa",
    copyHtml: "Salin HTML",
  },
  commandPalette: {
    title: "Command Palette",
    search: "Cari perintah",
    placeholder: "Cari perintah…",
    groups: {
      ai: "Aksi AI",
      document: "Dokumen",
      view: "Tampilan",
      navigation: "Navigasi",
    },
    saveSnapshot: "Simpan Snapshot",
    exportDocument: "Ekspor Dokumen",
    toggleTheme: "Ganti Tema",
    toggleDiff: "Tampilkan Diff",
    keyboardShortcuts: "Pintasan Keyboard",
    closePanel: "Tutup Panel",
    footerNav: "↑↓ navigasi",
    footerEnter: "↵ jalankan",
    footerEsc: "Esc tutup",
    noResults: "Perintah tidak ditemukan",
  },
  shortcuts: {
    title: "Pintasan Keyboard",
    close: "Tutup pintasan",
    platformNote: "Di macOS gunakan ⌘ · Di Windows / Linux gunakan Ctrl",
    items: {
      palette: "Buka command palette",
      improve: "Perbaiki Tulisan",
      grammar: "Cek Grammar",
      summarize: "Ringkas",
      expand: "Perluas",
      rewrite: "Tulis ulang dengan nada saat ini",
      theme: "Ganti mode terang / gelap",
      snapshot: "Simpan snapshot",
      close: "Tutup panel / modal",
      cheatsheet: "Buka daftar pintasan",
    },
  },
  mobile: {
    openAiActions: "Buka aksi AI",
    aiActions: "Aksi AI",
    closeAiActions: "Tutup aksi AI",
  },
  toast: {
    snapshotSaved: "Snapshot tersimpan",
    success: "Berhasil",
    error: "Error",
    info: "Info",
  },
  loading: {
    aiProcessing: "AI sedang memproses permintaan Anda…",
    ariaLabel: "Memuat",
  },
  theme: {
    toggle: "Ganti tema",
  },
  language: {
    toggle: "Ganti bahasa",
  },
  a11y: {
    dismissNotification: "Tutup notifikasi",
    notifications: "Notifikasi",
    aiActions: "Aksi AI",
    mainEditor: "Editor dokumen",
  },
  errors: {
    textTooShort: "Tulis minimal 10 karakter sebelum menggunakan AI.",
    generic: "Terjadi kesalahan. Coba lagi.",
  },
};

export const translations = { en, id } as const;

export type TranslationTree = typeof en;

function getNested(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const value = getNested(translations[locale] as unknown as Record<string, unknown>, key);
  if (typeof value !== "string") return key;
  if (!params) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, k: string) =>
    params[k] !== undefined ? String(params[k]) : `{{${k}}}`
  );
}

export function formatRelativeTime(locale: Locale, timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return translate(locale, "common.justNow");
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return translate(locale, "common.minutesAgo", { n: diffMin });
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return translate(locale, "common.hoursAgo", { n: diffHr });
  const diffDay = Math.floor(diffHr / 24);
  return translate(locale, "common.daysAgo", { n: diffDay });
}
