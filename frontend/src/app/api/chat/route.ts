import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SYSTEM_PROMPT = `You are "AARAMBH", a helpful, friendly, and knowledgeable assistant for the Government of Maharashtra's Single Window Clearance Portal.

Your goal is to guide entrepreneurs, investors, and business owners through clearances, MIDC land, approvals, subsidies, and compliance in plain, conversational language.

RESPONSE STYLE & RULES:

1. Tone — Friendly & Conversational:
   - Talk like a helpful, knowledgeable peer explaining things to a friend, not like a dry legal gazette or government circular.
   - Use warm, clear, and natural language. Be approachable, encouraging, and direct.
   - Example tone: "Yep, 19 is totally fine — the legal age to sign contracts and register a company in India is 18, so you're clear. Are you thinking of setting up in a MIDC industrial zone, or somewhere else? That'll change which approvals you actually need first."

2. Length — Short & Direct by Default:
   - Lead with a direct 2-4 sentence answer that immediately resolves the user's question.
   - Keep responses brief and punchy. Chat bubbles are small — avoid walls of text. Users can always ask follow-up questions if they want deeper breakdowns.

3. Tables — Do NOT Default to Tables:
   - Almost never use markdown tables for simple answers or step-by-step guidance.
   - Only use a table if the user explicitly asks for a comparison or if you are comparing 3+ options across multiple distinct criteria.
   - For sequential workflows or steps, use a concise numbered list (1, 2, 3) instead of multi-column tables with "Step / Description / Details" columns.

4. Clean Structure — No Bureaucratic Headers or Redundancy:
   - Do NOT use formal headers like "### Legal Basis", "### Statutory Framework", or "### Compliance Checklist".
   - Do NOT end responses with redundant repetitive summaries like "### Bottom Line:" or "In summary:". Say the core point once, clearly.

5. Natural Citations & Facts:
   - Stay 100% accurate on factual data (SLA turnaround days, department names like MIDC, MPCB, DISH, Fire NOC, FSSAI, RTS Act 2015 deemed approval timelines, PSI 2019 incentives).
   - Weave legal citations and statutory timelines naturally into conversational sentences (e.g., "under Maharashtra's RTS Act, if the department doesn't reply within 15 days, it's deemed approved").

6. One Clarifying Question for Broad Topics:
   - When a user asks an open-ended question (like "how to start a business" or "what approvals do I need"), give the quick baseline and ask ONE helpful clarifying question (such as sector, scale, or location) instead of dumping 20 department permits at once.

7. Multilingual Support:
   - English ("en"): Warm, crisp, conversational English.
   - Marathi ("mr"): Authentic, fluent, friendly Marathi (मराठी) that is conversational yet accurate on Maharashtra terms.
   - Hindi ("hi"): Authentic, fluent, friendly Hindi (हिंदी) that is warm, conversational, and precise.
   - If the user writes in Marathi or Hindi, reply in that language.`;

function getRuntimeApiKey(userKey?: string): string {
  if (userKey && userKey.trim().startsWith("gsk_")) {
    return userKey.trim();
  }

  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()) {
    return process.env.GROQ_API_KEY.trim();
  }

  // Hot-read from .env.local in real-time
  try {
    const envLocalPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, "utf-8");
      const match = content.match(/GROQ_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/i);
      if (match && match[1] && match[1].trim() && match[1].trim().startsWith("gsk_")) {
        const key = match[1].trim();
        process.env.GROQ_API_KEY = key;
        return key;
      }
    }
  } catch {
    // ignore
  }

  // Also check parent root .env
  try {
    const rootEnvPath = path.join(process.cwd(), "..", ".env");
    if (fs.existsSync(rootEnvPath)) {
      const content = fs.readFileSync(rootEnvPath, "utf-8");
      const match = content.match(/GROQ_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/i);
      if (match && match[1] && match[1].trim() && match[1].trim().startsWith("gsk_")) {
        const key = match[1].trim();
        process.env.GROQ_API_KEY = key;
        return key;
      }
    }
  } catch {
    // ignore
  }

  return "";
}

// Cached active models per API key
let cachedModels: { models: string[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

async function getAvailableGroqModels(apiKey: string): Promise<string[]> {
  if (cachedModels && Date.now() - cachedModels.timestamp < CACHE_TTL_MS) {
    return cachedModels.models;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.data)) {
        const activeIds: string[] = data.data
          .map((m: { id: string }) => m.id)
          .filter((id: string) => !id.includes("whisper") && !id.includes("guard") && !id.includes("tts"));

        // Sort by preferred chat models first
        const sorted = activeIds.sort((a, b) => {
          const getScore = (id: string) => {
            if (id.includes("qwen3.8")) return 100;
            if (id.includes("gpt-oss-120b")) return 95;
            if (id.includes("qwen3.6")) return 90;
            if (id.includes("gpt-oss-20b")) return 85;
            if (id.includes("llama-3.3")) return 80;
            if (id.includes("70b")) return 75;
            if (id.includes("llama-3.1")) return 70;
            if (id.includes("8b")) return 60;
            return 10;
          };
          return getScore(b) - getScore(a);
        });

        if (sorted.length > 0) {
          cachedModels = { models: sorted, timestamp: Date.now() };
          console.log("[AARAMBH Chat API] Dynamically discovered active Groq models:", sorted);
          return sorted;
        }
      }
    }
  } catch (e) {
    console.warn("[AARAMBH Chat API] Dynamic model lookup warning:", e);
  }

  // Safe fallback if lookup times out
  return [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-20b",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userApiKey, language } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: 'messages' array is required." },
        { status: 400 }
      );
    }

    const apiKey = getRuntimeApiKey(userApiKey);

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GROQ_API_KEY is not configured in frontend/.env.local or root .env.",
        },
        { status: 500 }
      );
    }

    // Dynamically retrieve only active models authorized for this API key
    const candidateModels = await getAvailableGroqModels(apiKey);

    let lastErrorText = "";
    let rateLimitHit = false;
    const attemptedErrors: Record<string, string> = {};

    const langInstruction =
      language === "mr"
        ? "\n[IMPORTANT: User has selected Marathi (मराठी). Respond completely and fluently in authentic Marathi, using standard Maharashtra Government administrative terms.]"
        : language === "hi"
        ? "\n[IMPORTANT: User has selected Hindi (हिंदी). Respond completely and fluently in authentic Hindi, using standard Government administrative terms.]"
        : "";

    for (const model of candidateModels) {
      try {
        const groqPayload = {
          model,
          messages: [
            { role: "system", content: `${SYSTEM_PROMPT}${langInstruction}` },
            ...messages.map((m: { role: string; content: string }) => ({
              role: m.role,
              content: m.content,
            })),
          ],
          temperature: 0.2,
          max_tokens: 1024,
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(groqPayload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const answer = data.choices?.[0]?.message?.content || "No response received.";
          return NextResponse.json({
            content: answer,
            model,
          });
        }

        const rawErr = await response.text();
        let parsedMessage = rawErr;
        try {
          const errObj = JSON.parse(rawErr);
          if (errObj?.error?.message) {
            parsedMessage = errObj.error.message;
          }
        } catch {
          // use rawErr
        }

        if (response.status === 401) {
          return NextResponse.json(
            { error: "Invalid or expired Groq API key. Please verify your GROQ_API_KEY." },
            { status: 401 }
          );
        }

        if (response.status === 429) {
          rateLimitHit = true;
        }

        attemptedErrors[model] = `[${response.status}] ${parsedMessage}`;
        lastErrorText = parsedMessage;
        console.warn(`[AARAMBH Chat API] Model ${model} returned ${response.status}: ${parsedMessage}`);
      } catch (modelErr) {
        const errMsg = modelErr instanceof Error ? modelErr.message : String(modelErr);
        attemptedErrors[model] = `[Exception] ${errMsg}`;
        lastErrorText = errMsg;
        console.warn(`[AARAMBH Chat API] Model ${model} fetch failed:`, modelErr);
      }
    }

    console.error("[AARAMBH Chat API] All models exhausted. Failures:", attemptedErrors);

    if (rateLimitHit) {
      return NextResponse.json(
        { error: "Groq API rate limit reached. Please wait a few seconds and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `Groq Advisory Error: ${lastErrorText || "Service temporarily unavailable. Please retry in a moment."}` },
      { status: 502 }
    );
  } catch (err: unknown) {
    console.error("[AARAMBH Chat API] Exception in route handler:", err);
    return NextResponse.json(
      { error: (err instanceof Error ? err.message : "Internal server error in AARAMBH Chat Service") },
      { status: 500 }
    );
  }
}
