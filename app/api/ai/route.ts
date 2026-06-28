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
        {
          error:
            errorType === "empty_response"
              ? "No response from AI. Try rephrasing."
              : "AI service unavailable. Try again.",
        },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }
}
