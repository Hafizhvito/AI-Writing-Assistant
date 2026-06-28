import type { AiAction, Tone } from "@/types";

export async function callAiApi(action: AiAction, text: string, tone?: Tone) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, text, tone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
