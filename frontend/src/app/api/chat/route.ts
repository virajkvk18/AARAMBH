import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are "AARAMBH", the official AI clearance and investment assistant for the Government of Maharashtra's Single Window Clearance System (AARAMBH Portal).

Core Directives:
1. Direct Answers First: ALWAYS directly and specifically answer the user's question in the very first sentence. Never start with a generic greeting, canned disclaimer, or capability list unless specifically asked.
2. Tone & Style: Maintain a professional, concise, authoritative government advisory tone. Do not use informal language, unnecessary filler, or excessive emojis. Use clear bullet points and bold headers for readability.
3. Legal & Business Eligibility (e.g. Age, Registration, Compliance):
   - Under the Indian Contract Act (1872) and Indian Majority Act (1875), any individual aged 18 or older is legally competent to contract, register an enterprise, hold commercial assets, and serve as a Director, Partner, or Sole Proprietor.
   - Outline the legal entity options (Sole Proprietorship / Udyam MSME, Private Limited Company via MCA SPICe+, LLP, Partnership).
   - Detail the primary statutory identity requirements: PAN, Aadhaar, Bank Account, GSTIN.
   - Explain how once registered, statutory industrial clearances in Maharashtra (MIDC land allotment, MPCB consent, Fire NOC, DISH factory license) are processed seamlessly through the AARAMBH Single Window Portal.
4. Maharashtra Statutory Clearances & Regulations:
   - MIDC (Maharashtra Industrial Development Corporation): Land plot allocation, zoning, building layout blueprint approval (SLA: 15 working days).
   - MPCB (Maharashtra Pollution Control Board): Consent to Establish (CTE) & Consent to Operate (CTO) categorized by pollution index: White (exempt/intimation), Green, Orange, Red (SLA: 15 to 30 working days).
   - Directorate of Maharashtra Fire Services: Provisional Fire Safety NOC and Final NOC (SLA: 14 working days).
   - DISH (Directorate of Industrial Safety & Health): Factory license under the Factories Act 1948, boiler registration, worker safety approval (SLA: 10 working days).
   - MSEDCL (Maharashtra State Electricity Distribution Co. Ltd): HT/LT power connectivity feasibility (SLA: 7 working days).
   - Deemed Approvals: Under the Maharashtra Right to Public Services Act (RTS Act 2015), clearances not queried or resolved within statutory SLA working days are deemed approved by operation of law.
   - Package Scheme of Incentives (PSI 2019): Subsidies on capital investment (15% to 40%+), electricity duty exemptions, and stamp duty waivers.
5. Out-of-Scope Requests:
   - If a question is entirely unrelated to business, industry, trade, or statutory clearances (e.g. sports, entertainment, general trivia), state succinctly that your scope is dedicated to Maharashtra business registrations, industrial clearances, and regulatory compliance, and politely redirect the user.
6. Ambiguous Requests:
   - When a user query lacks necessary project parameters (such as sector category, proposed investment amount, or geographic zone), answer the known aspects directly, then ask 1-2 precise clarifying questions.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userApiKey } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: 'messages' array is required." },
        { status: 400 }
      );
    }

    const apiKey = (userApiKey && userApiKey.trim().startsWith("gsk_"))
      ? userApiKey.trim()
      : (process.env.GROQ_API_KEY || process.env.GROQ_KEY || "");

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    if (!apiKey) {
      // Direct, contextual fallback answering the exact question if API key is not configured
      const q = lastUserMessage.toLowerCase();
      let answer = "";

      if (q.includes("19") || q.includes("age") || q.includes("start a business") || q.includes("young")) {
        answer = `**Yes, at 19 years old, you are fully legally eligible to start, register, and operate a business in Maharashtra.**

### 1. Legal Eligibility
Under the **Indian Majority Act (1875)** and the **Indian Contract Act (1872)**, any individual who is 18 years or older is legally an adult competent to enter into binding legal contracts, hold commercial assets, and serve as a business owner or corporate director.

---

### 2. Available Business Structures
You can establish your venture under any of the following structures:
- **Sole Proprietorship:** Easiest to start; register via **Udyam MSME Registration** (free, instant online).
- **Private Limited Company:** Registered through the Ministry of Corporate Affairs (MCA) SPICe+ form; you can be a Director and Shareholder.
- **Limited Liability Partnership (LLP):** Suitable for multi-founder ventures with limited liability protection.
- **Partnership Firm:** Registered with the Maharashtra Registrar of Firms (RoF).

---

### 3. Core Prerequisites to Begin
To register your business and open a current bank account, you will need:
1. **Permanent Account Number (PAN)**
2. **Aadhaar Card** (for e-KYC and digital signature verification)
3. **Dedicated Business Bank Account**
4. **GST Registration (GSTIN)** (mandatory if annual turnover exceeds statutory thresholds or for inter-state sales)

---

### 4. Maharashtra Single Window Clearances (AARAMBH)
Once your legal entity is formed, all statutory industrial and operational clearances can be processed through the **AARAMBH Single Window Portal**:
- **Land & Zoning:** MIDC plot allotment and building blueprint approval (15-day SLA).
- **Environmental Consent:** MPCB Consent to Establish (CTE) based on your pollution categorization (White/Green/Orange/Red).
- **Factory & Safety:** DISH factory license and Fire Safety NOC.
- **State Subsidies:** Eligible for capital subsidies and power tariff incentives under the **Package Scheme of Incentives (PSI 2019)**.

*(To connect this assistant to live Groq Llama 3.3 70B inference, configure \`GROQ_API_KEY\` in \`frontend/.env.local\` or in the chat settings ⚙️)*`;
      } else {
        answer = `**AARAMBH Single Window Assistant**

Your query regarding **"${lastUserMessage}"** has been received. 

To provide you with the most accurate regulatory pathway, please specify:
1. **Industry Sector** (e.g., Manufacturing, Food Processing, IT/ITES, Chemicals)
2. **Proposed Location** (e.g., MIDC Industrial Estate, Municipal Corporation, or Private Land)
3. **Investment Scale** (MSME, Large Enterprise, or Mega Project)

*(Note: Live AI generation with Groq Llama 3.3 70B can be activated by providing your \`GROQ_API_KEY\` in \`frontend/.env.local\` or chat settings ⚙️)*`;
      }

      return NextResponse.json({
        content: answer,
        model: "contextual-fallback",
      });
    }

    // Call Groq API via official chat completions endpoint
    const groqPayload = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.3,
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
      // Fallback to llama-3.1-8b-instant if 70B is rate-limited or busy
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
        const errText = await response.text();
        return NextResponse.json(
          { error: `Groq API error (${response.status}): ${errText}` },
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
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: (err instanceof Error ? err.message : "Internal server error") },
      { status: 500 }
    );
  }
}
