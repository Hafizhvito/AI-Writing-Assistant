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

export function escapeHtml(s: string): string {
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
