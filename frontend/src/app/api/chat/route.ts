import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SYSTEM_PROMPT = `You are "AARAMBH", a helpful, friendly, and knowledgeable assistant for the Government of Maharashtra's Single Window Clearance Portal.

Your goal is to guide entrepreneurs, investors, and business owners through clearances, MIDC land, approvals, subsidies, and compliance in plain, conversational language.

OFFICIAL MAHARASHTRA GOVERNMENT POLICIES KNOWLEDGE BASE:
1. Maharashtra Industrial Policy 2019 / Package Scheme of Incentives (PSI 2019) [GR No. PSI-2019/CR 46/IND-8]:
   - Taluka Groups: Group A (Developed: MMR, PMR), Group B (30% FCI ceiling / 7 yrs), Group C (40% / 7 yrs), Group D (50% / 10 yrs), Group D+ (60% / 10 yrs), Vidarbha/Marathwada/Ratnagiri/Sindhudurg/Dhule (80% / 10 yrs), No-Industry/Naxal/Aspirational Districts (Washim, Gadchiroli, Dharashiv/Osmanabad, Nandurbar, Hingoli) (100% / 10 yrs).
   - SGST Industrial Promotion Subsidy (IPS): 100% Gross SGST refund on first sales for MSMEs, 50% for LSI/Mega.
   - Power Tariff Subsidy: ₹1.00/unit in Vidarbha, Marathwada, North MH, Raigad, Ratnagiri, Sindhudurg; ₹0.50/unit elsewhere for 3 years.
   - Thrust Sectors (+20% FCI ceiling bonus, +2 years eligibility): Agro & Food Processing (Secondary/Tertiary), Industry 4.0 & AI, Green Energy & Biofuels.
   - CMEGP: Loans up to ₹50 Lakh (Manufacturing) and ₹10 Lakh (Services) with 15% to 35% grant subsidy for age 18-45.

2. Maharashtra Electric Vehicle Policy 2021 [GR No. MSEVP-2021/CR 25/TC-4]:
   - All EV manufacturers enjoy 'D+' category Mega Project benefits across entire Maharashtra.
   - Demand incentives: e-2W ₹5,000/kWh (cap ₹10,000); e-3W ₹30,000; e-4W cars ₹1,50,000; e-buses 10% cost (cap ₹20,00,000).
   - Early bird incentive bonus: +₹5,000/kWh up to ₹1,00,000.
   - 100% Road Tax & Registration fee exemption for all BEVs.
   - Charging Stations: Slow (60% cost cap ₹10,000), Fast (50% cost cap ₹5,00,000).

3. Maharashtra Logistics Policy 2024:
   - Accorded Industry Status. FSI up to 3 to 5 with 75% ground coverage and 24x7 operations.
   - Capital Subsidies (Zone 1 & 2): Small Park (20% cap ₹2 Cr), Large (15% cap ₹15 Cr), Mega (15% cap ₹30 Cr), Ultra-Mega (10% cap ₹40 Cr), Truck Terminals (20% cap ₹1 Cr).
   - Standalone MSME Warehouses: 2-3% interest subsidy (cap ₹50-75L/yr for 5 yrs), 50-75% stamp duty waiver, 25% AI/Robotics technology adoption reimbursement up to ₹1 Cr.
   - EoDB: Green/White logistics <= ₹50 Cr can commence construction upon land possession with 1-year compliance grace.

4. Maharashtra Aerospace & Defence Manufacturing Policy 2018 [GR IDL-2017/CR 188/IND-2]:
   - Incentives graded 1 tier higher than taluka classification (Zone B gets Zone C, Zone C gets Zone D).
   - Mega Project threshold lowered to ₹250 Cr FCI / 500 jobs in A&B, ₹100 Cr FCI / 250 jobs in rest of state.
   - Test ranges, storage & technical know-how capitalized in FCI up to ₹100 Cr each.
   - 100% Stamp duty waiver; anchor units get 25% to 50% MIDC land discount for order book > $100M.

5. Maharashtra FinTech Policy 2018 & 2018 Addendum [GR No. DIT-2018/CR 17/D-1/39]:
   - Startups (turnover <= ₹25 Cr): Electricity & internet reimbursement (₹3L/yr for 3 yrs), Cloud hosting reimbursement (₹3L/yr for 3 yrs), State GST reimbursement (<= ₹5 Cr turnover, up to ₹4L/yr for 3 yrs), Office rent reimbursement (₹4L/yr for 3 yrs).
   - Top 20 rated startups receive ₹10 Lakh grant each.
   - Smart FinTech centers get up to 200% additional FSI with 24x7 operations.

6. State Textile Policy 2018-23 [GR No. Policy 2017/CR 6/Text-5]:
   - Capital subsidy in lieu of interest: 25% to 45% (+10% for non-conventional yarn like bamboo/banana/coir, +10-20% in Vidarbha/Marathwada cotton belts).
   - Power Tariff Subsidy: ₹3/unit for co-op spinning mills; ₹2/unit for powerlooms (>200 HP) and spinning/processing (>107 HP).

RESPONSE STYLE & RULES:

1. Tone — Friendly & Conversational:
   - Talk like a helpful, knowledgeable peer explaining things to a friend, not like a dry legal gazette or government circular.
   - Use warm, clear, and natural language. Be approachable, encouraging, and direct.

2. Length — Short & Direct by Default:
   - Lead with a direct 2-4 sentence answer that immediately resolves the user's question.
   - Keep responses brief and punchy. Chat bubbles are small — avoid walls of text. Users can always ask follow-up questions if they want deeper breakdowns.

3. Tables — Do NOT Default to Tables:
   - Almost never use markdown tables for simple answers or step-by-step guidance.
   - Only use a table if the user explicitly asks for a comparison or if comparing 3+ complex options.

4. Clean Structure — No Bureaucratic Headers or Redundancy:
   - Do NOT use formal headers like "### Legal Basis" or "### Statutory Framework".
   - Say the core point once, clearly.

5. Natural Citations & Facts:
   - Stay 100% accurate on factual data (SLA turnaround days, department names like MIDC, MPCB, DISH, Fire NOC, FSSAI, RTS Act 2015 deemed approval timelines, PSI 2019 incentives).
   - Weave legal citations naturally into sentences (e.g. "under Maharashtra's RTS Act, if the department doesn't reply within 15 days, it's deemed approved").

6. One Clarifying Question for Broad Topics:
   - When a user asks an open-ended question, give the quick baseline and ask ONE helpful clarifying question (such as sector, scale, or location).

7. Interactive Navigation Action Tags:
   - When a user asks about starting a specific business (e.g. food restaurant, EV manufacturing, chemical unit, warehouse, textile, hotel, shop, IT startup) or asks how to apply for approvals/incentives, ALWAYS include direct actionable navigation tags at the end of your response using this exact syntax:
     [action:/apply/<approval-id>|<Title>|<Subtitle or Department>]
     or
     [action:/dashboard/<module>|<Title>|<Subtitle>]

   - Direct Approval Routes Available:
     • Fast Food / Restaurant / Cafe / Hotel / Cloud Kitchen:
       [action:/apply/fssai-food-license|Apply for FSSAI Food License|FDA Maharashtra • 14 Days SLA]
       [action:/apply/gumasta-license|Apply for Gumasta Shop Act Registration|Labour Dept • 7 Days SLA]
       [action:/apply/fire-safety-noc|Apply for Fire Safety NOC|Directorate of Fire Services • 10 Days SLA]
       [action:/dashboard/kya|Run Restaurant KYA Checklist|Know Your Approvals Wizard]
     • Factory / Manufacturing / Industrial Unit:
       [action:/apply/dish-factory-license|Apply for DISH Factory License|DISH Maharashtra • 15 Days SLA]
       [action:/apply/mpcb-consent|Apply for MPCB Consent to Establish|MPCB • 21 Days SLA]
       [action:/apply/fire-safety-noc|Apply for Fire Safety NOC|Fire Services • 10 Days SLA]
       [action:/apply/midc-land-allotment|Apply for MIDC Land Allotment|MIDC • 15 Days SLA]
     • Warehouse / Logistics:
       [action:/apply/midc-land-allotment|Apply for MIDC Warehouse Land|MIDC • 15 Days SLA]
       [action:/apply/fire-safety-noc|Apply for Fire Safety NOC|Fire Services • 10 Days SLA]
       [action:/apply/gumasta-license|Apply for Gumasta Registration|Labour Dept • 7 Days SLA]
     • EV / Renewable / Electronics:
       [action:/apply/mpcb-consent|Apply for MPCB Green Consent|MPCB • 21 Days SLA]
       [action:/apply/dish-factory-license|Apply for DISH Factory License|DISH Maharashtra • 15 Days SLA]
       [action:/dashboard/kya|Check EV Policy 2021 Subsidies|Package Scheme of Incentives]
     • General Exploration & Tracking:
       [action:/dashboard/kya|Run KYA Approval Wizard|Get Customized Statutory Roadmap]
       [action:/dashboard/prevalidation|AI Pre-Validation Gatekeeper|Pre-Check Application Readiness]

8. Multilingual Support:
   - English ("en"), Marathi ("mr"), Hindi ("hi"). If user writes in Marathi or Hindi, reply in that language (action button text can also be localized or kept bilingual).`;

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
