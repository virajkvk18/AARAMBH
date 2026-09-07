import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SYSTEM_PROMPT = `You are "AARAMBH", the official clearance and investment advisory intelligence for the Government of Maharashtra's Single Window Clearance System (AARAMBH Portal).

Core Operational Rules:
1. Direct Answer First: ALWAYS answer the user's specific question directly in the very first sentence. If asked about age eligibility (e.g. 16, 17, 18, 19), immediately explain the legal age requirement under Indian Law (Indian Contract Act 1872 & Indian Majority Act 1875 where age 18 is the age of majority; minors under 18 cannot enter into binding commercial contracts or be direct company directors, but can have a business registered through a legal guardian/parent or hold shares in trust).
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

  // Hot-read from .env.local in real-time so users don't have to restart server
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

    console.log(
      `[AARAMBH Chat API] Request received. Key status: ${
        apiKey ? `VALID (${apiKey.slice(0, 6)}...${apiKey.slice(-4)})` : "EMPTY"
      }`
    );

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Please paste your Groq API key into frontend/.env.local (e.g. GROQ_API_KEY=gsk_...) and save the file.",
        },
        { status: 500 }
      );
    }

    // Call official Groq API endpoint
    const groqPayload = {
      model: "llama-3.3-70b-versatile",
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

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(groqPayload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[AARAMBH Chat API] Groq 70B call failed (${response.status}):`, errText);

      // Attempt fallback to 8B instant model
      const fallbackResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          ...groqPayload,
          model: "llama-3.1-8b-instant",
        }),
      });

      if (!fallbackResponse.ok) {
        return NextResponse.json(
          { error: `Groq API Error (${response.status}): ${errText}` },
          { status: response.status }
        );
      }

      const fallbackData = await fallbackResponse.json();
      const answer = fallbackData.choices?.[0]?.message?.content || "No response received.";
      return NextResponse.json({
        content: answer,
        model: "llama-3.1-8b-instant",
      });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "No response received.";

    return NextResponse.json({
      content: answer,
      model: "llama-3.3-70b-versatile",
    });
  } catch (err: unknown) {
    console.error("[AARAMBH Chat API] Exception in route handler:", err);
    return NextResponse.json(
      { error: (err instanceof Error ? err.message : "Internal server error in AARAMBH Chat Service") },
      { status: 500 }
    );
  }
}
