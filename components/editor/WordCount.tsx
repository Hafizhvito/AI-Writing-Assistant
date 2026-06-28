interface WordCountProps {
  text: string;
}

export default function WordCount({ text }: WordCountProps) {
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  const chars = text.length;
  const readingMins = Math.max(1, Math.ceil(words / 200));

  return (
    <div
      className="flex items-center gap-4 text-sm"
      style={{ color: "var(--text-muted)" }}
    >
      <span>
        <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
          {words.toLocaleString()}
        </span>{" "}
        {words === 1 ? "word" : "words"}
      </span>
      <span style={{ color: "var(--border-default)" }}>|</span>
      <span>
        <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
          {chars.toLocaleString()}
        </span>{" "}
        {chars === 1 ? "char" : "chars"}
      </span>
      <span style={{ color: "var(--border-default)" }}>|</span>
      <span>
        {readingMins} min read
      </span>
    </div>
  );
}
