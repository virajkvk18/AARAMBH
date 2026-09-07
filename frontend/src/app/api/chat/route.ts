import { NextRequest, NextResponse } from "next/server";

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

    const apiKey = (userApiKey && userApiKey.trim().startsWith("gsk_"))
      ? userApiKey.trim()
      : (process.env.GROQ_API_KEY || process.env.GROQ_KEY || "");

    console.log(
      `[AARAMBH Chat API] Incoming request with ${messages.length} messages. GROQ_API_KEY status: ${
        apiKey ? `CONFIGURED (${apiKey.slice(0, 6)}...${apiKey.slice(-4)})` : "NOT CONFIGURED"
      }`
    );

    if (!apiKey) {
      console.warn("[AARAMBH Chat API] GROQ_API_KEY is not set in environment.");
      return NextResponse.json(
        {
          error:
            "GROQ_API_KEY is not set. Please add GROQ_API_KEY=gsk_... to frontend/.env.local and restart the server.",
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

    console.log("[AARAMBH Chat API] Calling Groq API with model: llama-3.3-70b-versatile...");

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
      console.log("[AARAMBH Chat API] Attempting fallback to llama-3.1-8b-instant...");
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
        const fallbackErrText = await fallbackResponse.text();
        console.error(`[AARAMBH Chat API] Groq 8B fallback failed (${fallbackResponse.status}):`, fallbackErrText);
        return NextResponse.json(
          { error: `Groq API Error (${response.status}): ${errText}` },
          { status: response.status }
        );
      }

      const fallbackData = await fallbackResponse.json();
      const answer = fallbackData.choices?.[0]?.message?.content || "No response received.";
      console.log("[AARAMBH Chat API] Successfully generated response via llama-3.1-8b-instant.");
      return NextResponse.json({
        content: answer,
        model: "llama-3.1-8b-instant",
      });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "No response received.";
    console.log("[AARAMBH Chat API] Successfully generated response via llama-3.3-70b-versatile.");

    return NextResponse.json({
      content: answer,
      model: "llama-3.3-70b-versatile",
    });
  } catch (err: unknown) {
    console.error("[AARAMBH Chat API] Unexpected exception in route handler:", err);
    return NextResponse.json(
      { error: (err instanceof Error ? err.message : "Internal server error in AARAMBH Chat Service") },
      { status: 500 }
    );
  }
}
