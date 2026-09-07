import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are "Ask AARAMBH", the official intelligent AI clearance assistant for the Government of Maharashtra's Single Window Clearance System (AARAMBH).

Your purpose:
Provide accurate, structured, and helpful guidance to industrial investors, entrepreneurs, MSMEs, and business owners looking to establish, expand, or operate businesses in Maharashtra.

Key Knowledge Base:
1. Major Statutory Regulatory Bodies in Maharashtra:
   - MIDC (Maharashtra Industrial Development Corporation): Land plot allotment, provisional possession, building plan blueprint approvals, water supply allocation. (Standard SLA: 15 working days).
   - MPCB (Maharashtra Pollution Control Board): Consent to Establish (CTE) & Consent to Operate (CTO) categorized under White, Green, Orange, and Red industrial categories. (Standard SLA: 21 working days).
   - Directorate of Maharashtra Fire Services: Provisional Fire Safety NOC and Final Fire NOC for industrial buildings and high-hazard plants. (Standard SLA: 14 working days).
   - DISH (Directorate of Industrial Safety & Health): Factory license under the Factories Act 1948, boiler registration, worker occupational safety. (Standard SLA: 10 working days).
   - MSEDCL (Maharashtra State Electricity Distribution Co. Ltd): HT/LT power connection feasibility and transformer energization. (Standard SLA: 7 working days).
   - FDA Maharashtra: Food and Drug Administration manufacturing licenses and FSSAI state clearance.

2. Statutory Deemed Approvals:
   - Under the Maharashtra Right to Public Services Act (RTS Act), if any state regulatory department fails to query, reject, or issue an approval within the designated SLA statutory working days, the clearance is automatically deemed approved by law.

3. Package Scheme of Incentives (PSI 2019):
   - Industrial subsidies, capital subsidies (up to 100% of Fixed Capital Investment in Taluka D/D+ areas), stamp duty exemptions, electricity duty waivers, and interest subvention for MSMEs, Large & Mega projects.

4. Single Window Infrastructure:
   - Common Application Form (CAF), DigiLocker integration, AI Document Vault (automated OCR for PAN, Land Registry, Blueprint), Pre-Validation tolerance checking (zero-rejection guarantee), Multi-department DAG orchestrator.

Response Guidelines:
- Be concise, professional, warm, and highly structured with bullet points.
- Cite statutory SLA working days, relevant acts, and exact departments where applicable.
- If the user asks in Marathi or Hindi, reply fluently in the requested language while keeping terminology clear.
- Always recommend relevant single-window actions (e.g. KYA Wizard, Document Vault, Pre-validation, SLA Tracker).`;

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

    const apiKey = userApiKey || process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Return a smart fallback response if no API key is provided
      const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
      let fallbackText = "Hello! I am **Ask AARAMBH**, your Maharashtra Single Window AI Guide.\n\n";

      if (lastUserMessage.includes("midc") || lastUserMessage.includes("land")) {
        fallbackText += "**MIDC Land Allotment & Plan Approval:**\n• **Department:** Maharashtra Industrial Development Corporation (MIDC)\n• **Statutory SLA:** 15 Working Days\n• **Requirements:** Plot application, Project DPR, Proposed building layout, Water quota request.\n• **Single-Window Process:** You can upload your layout to the Document Vault for automated verification.";
      } else if (lastUserMessage.includes("mpcb") || lastUserMessage.includes("pollution") || lastUserMessage.includes("cte")) {
        fallbackText += "**MPCB Consent to Establish (CTE):**\n• **Department:** Maharashtra Pollution Control Board (MPCB)\n• **Statutory SLA:** 21 Working Days\n• **Categories:** Red (Heavy/Hazardous), Orange (Moderate), Green (Low), White (Pollution-free/Exempt).\n• **Zero Rejection:** Use AARAMBH Pre-Validation to ensure your effluent & plot parameters match prior to submission.";
      } else if (lastUserMessage.includes("deemed") || lastUserMessage.includes("sla")) {
        fallbackText += "**Deemed Approval Guarantee:**\n• Governed under the **Maharashtra Right to Public Services Act**.\n• If a department does not respond within statutory SLA days, approval is automatically triggered with legal deemed certificate generation.";
      } else {
        fallbackText += "I can help you navigate statutory clearances across **MIDC, MPCB, DISH, Fire Services, and MSEDCL**, calculate your **PSI 2019 incentives**, and track statutory **SLA deemed approvals**.\n\n*(To connect directly to live Groq AI, please set `GROQ_API_KEY` in your environment or click the Settings gear in this chat window!)*";
      }

      return NextResponse.json({
        content: fallbackText,
        model: "offline-fallback",
      });
    }

    // Call Groq API via standard completions endpoint
    const groqPayload = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.5,
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
      console.error("Groq API error:", response.status, errText);

      // Try fallback to smaller Groq model if 70B fails
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
          { error: `Groq API returned status ${response.status}. Please check your API key.` },
          { status: response.status }
        );
      }

      const fallbackData = await fallbackResponse.json();
      const answer = fallbackData.choices?.[0]?.message?.content || "No response generated.";
      return NextResponse.json({
        content: answer,
        model: "llama-3.1-8b-instant",
      });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "No response generated.";

    return NextResponse.json({
      content: answer,
      model: "llama-3.3-70b-versatile",
    });
  } catch (err: unknown) {
    console.error("Chat API route handler error:", err);
    return NextResponse.json(
      { error: (err instanceof Error ? err.message : "Internal server error") },
      { status: 500 }
    );
  }
}
