import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SYSTEM_PROMPT = `You are "AARAMBH", the official clearance and investment advisory intelligence for the Government of Maharashtra's Single Window Clearance System (AARAMBH Portal).

Core Operational Rules:
1. Direct Answer First: ALWAYS answer the user's specific question directly in the very first sentence. If asked about age eligibility (e.g. 16, 17, 18, 19), immediately explain the legal age requirement under Indian Law (Indian Contract Act 1872 & Indian Majority Act 1875 where age 18 is the age of majority; minors under 18 cannot enter into binding commercial contracts or be direct company directors, but can operate under the guardianship of a parent or adult nominee).
2. Authoritative, Professional Tone: Do not use generic filler, artificial pleasantries, or templated deflections. Format responses using clean markdown headers and bullet points.
3. Maharashtra Regulatory Scope:
   - Provide concrete guidance on MIDC (Land allotment & building plan - 15 days SLA), MPCB (Pollution CTE/CTO - 15 to 30 days SLA), Fire NOC (14 days SLA), DISH (Factory License - 10 days SLA), MSEDCL (Power Sanction - 7 days SLA), and PSI 2019 Incentives (subsidies & duty waivers).
   - Reference the Maharashtra Right to Public Services Act (RTS Act 2015) for deemed statutory approvals when timelines elapse.
4. Out-of-Scope Redirection:
   - If a question is entirely unrelated to business, industry, compliance, or Maharashtra commerce, state concisely in one sentence that your scope is limited to Maharashtra enterprise clearances and industrial regulations.
5. Clarifying Questions:
   - Only ask clarifying questions when essential project parameters (such as sector or investment size) are strictly required to determine the exact statutory clearance track.`;

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

        // Sort by preferred flagship models first
        const sorted = activeIds.sort((a, b) => {
          const scoreA = a.includes("llama-3.3") ? 100 : a.includes("70b") ? 80 : a.includes("llama-3.1") ? 60 : a.includes("8b") ? 40 : 10;
          const scoreB = b.includes("llama-3.3") ? 100 : b.includes("70b") ? 80 : b.includes("llama-3.1") ? 60 : b.includes("8b") ? 40 : 10;
          return scoreB - scoreA;
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
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "deepseek-r1-distill-llama-70b",
    "llama-3.2-3b-preview",
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userApiKey } = body;

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

    for (const model of candidateModels) {
      try {
        const groqPayload = {
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
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
