import { NextResponse } from "next/server";

const GROQ_KEY = process.env.GROQ_API_KEY || "";

// Active Groq models list (with fallback chain)
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
];

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY || GROQ_KEY;

    const systemPrompt = `You are 'RE:USE Chatbot' - an intelligent AI campus assistant for the RE:USE Peer-to-Peer equipment sharing marketplace.
Your goal: Help college students borrow and lend equipment (DSLR cameras, impact drills, scientific calculators, laptops, projectors, camping gear).
Be polite, friendly, helpful, and concise. Respond in clean markdown. You can understand English, Hindi, and Hinglish.
Mention campus pickup spots like MIT Library Lawn, COEP Tech Porch, FC Road, and Symbiosis SB Road when relevant.
Explain that all transactions feature 100% refundable security deposits held safely in Escrow!`;

    const formattedHistory = Array.isArray(history)
      ? history
          .map((m: any) => ({
            role: m.sender === "user" || m.role === "user" ? "user" : "assistant",
            content: m.text || m.content || "",
          }))
          .filter((m: any) => m.content.trim() !== "")
      : [];

    const messages = [
      { role: "system", content: systemPrompt },
      ...formattedHistory.slice(-6),
      { role: "user", content: message },
    ];

    let lastErrorText = "";
    let reply = "";
    let modelUsed = "";

    // Try models in order until success
    for (const model of GROQ_MODELS) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 600,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          reply = data.choices?.[0]?.message?.content || "";
          if (reply) {
            modelUsed = model;
            break;
          }
        } else {
          lastErrorText = await response.text();
          console.warn(`Groq Model ${model} failed:`, lastErrorText);
        }
      } catch (err: any) {
        console.warn(`Groq fetch error for model ${model}:`, err);
      }
    }

    if (!reply) {
      return NextResponse.json(
        { error: "Groq API error", details: lastErrorText },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reply: reply,
      model: modelUsed,
    });
  } catch (err: any) {
    console.error("Next.js AI Chat Route Exception:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
