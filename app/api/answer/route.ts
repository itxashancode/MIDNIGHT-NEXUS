import { fetchGemmaFunctionCalls, fetchGemmaStream, ConversationTurn, GemmaImagePart } from "@/lib/gemma";
import { createSSETransform } from "@/lib/stream";
import { tavilySearch } from "@/lib/search";
import { fetchFinanceNews, fetchExchangeRates } from "@/lib/finance";
import { fetchCryptoPrices, fetchTrendingCrypto } from "@/lib/crypto";

export const runtime = "edge";

const webSearchTool = {
  name: "web_search",
  description: "Search the live web for real-time information. Use <|\"|> delimiters for all string values.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The precise search query, enclosed in <|\"|> tokens."
      }
    },
    required: ["query"]
  }
};

const financeSearchTool = {
  name: "finance_search",
  description: "Get real-time financial news, ticker updates, and market intelligence. Use this for stocks, mergers, or market trends.",
  parameters: {
    type: "object",
    properties: {
      tickers: {
        type: "string",
        description: "Comma-separated stock tickers (e.g., 'AAPL,TSLA')."
      },
      keywords: {
        type: "string",
        description: "Search keywords (e.g., 'merger', 'earnings')."
      }
    }
  }
};

const currencyExchangeTool = {
  name: "currency_exchange",
  description: "Convert currency amounts or get the latest exchange rates for global currencies.",
  parameters: {
    type: "object",
    properties: {
      from: { type: "string", description: "Source currency code (e.g., 'USD')." },
      to: { type: "string", description: "Target currency code (e.g., 'EUR')." },
      amount: { type: "number", description: "Amount to convert." },
      base: { type: "string", description: "Base currency for general rates lookup." }
    }
  }
};

const cryptoPricesTool = {
  name: "crypto_prices",
  description: "Get real-time cryptocurrency prices. Use CoinGecko IDs (e.g., 'bitcoin', 'ethereum', 'solana').",
  parameters: {
    type: "object",
    properties: {
      ids: { type: "string", description: "Comma-separated crypto IDs." },
      vs_currencies: { type: "string", description: "Target currency (default: 'usd')." }
    },
    required: ["ids"]
  }
};

const cryptoTrendingTool = {
  name: "trending_crypto",
  description: "Get the top trending coins on CoinGecko in the last 24 hours.",
  parameters: { type: "object", properties: {} }
};

export async function POST(req: Request) {
  try {
    const { message, thoughts, image, history } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "anonymous";

    // 1. Rate Limiting (10 requests per minute)
    const { checkRateLimit, validateImage, sanitizeThought, sanitizeInput } = await import("@/lib/security");
    if (!(await checkRateLimit(ip))) {
      return new Response("Too many requests. Please wait a minute.", { status: 429 });
    }

    // Origin Validation (CORS)
    const origin = req.headers.get("origin");
    if (origin && !origin.includes("localhost") && origin !== "https://deadstarai.vercel.app") {
      return new Response("Forbidden: Invalid Origin", { status: 403 });
    }

    // 2. Image Validation (Max 2.5MB for Hobby Tier Bandwidth)
    if (image && !validateImage(image.base64)) {
      return new Response("Invalid image format or size. Only WebP under 2.5MB is supported.", { status: 400 });
    }

    const sanitizedMessage = sanitizeInput(message);
    if (sanitizedMessage === "[BLOCKED_POTENTIAL_INJECTION]") {
      return new Response("Malicious intent detected. Request blocked.", { status: 403 });
    }

    if (!sanitizedMessage && !image) {
      return new Response("Invalid request", { status: 400 });
    }
    if (!thoughts || !Array.isArray(thoughts)) {
      return new Response("Invalid request", { status: 400 });
    }

    // 3. Prompt Injection Mitigation: Sanitize and use robust delimiters
    const cleanThoughts = thoughts.map(t => sanitizeThought(t));
    const formattedReasoning = cleanThoughts.map(t => `###_REASONING_NODE_###\n${t}\n###_END_NODE_###`).join("\n");

    const imageData: GemmaImagePart | undefined = image
      ? { inlineData: { mimeType: image.mimeType, data: image.base64 } }
      : undefined;

    const baseIdentity = `You are a sharp, opinionated developer on Slack. 
Vibe: Direct, technical, no-nonsense.
Tone: Human, varied, slightly edgy. No fluff.

STRICT WRITING RULES (ANTI-AI):
- NO significance inflation: Never say "stands as a testament," "pivotal moment," or "evolving landscape."
- NO promotional fluff: Avoid "groundbreaking," "seamless," or "stunning."
- Use active voice. Be direct. If you don't know something, say so.
- Vary sentence length. Use short, punchy technical take-aways.

[FRONTEND_CAPABILITY]: When coding UI, websites, or components:
- TONE: Pick an extreme (Brutally Minimal, Retro-Futuristic, Industrial, Luxury).
- TYPOGRAPHY: Use distinctive pairings; avoid Inter/Arial/System fonts.
- ASSETS: Use asymmetric layouts, grid-breaking elements, and noise/grain textures.
- MOTION: Staggered reveals and hover-delight; prioritize CSS-only for speed.
- GOAL: Make it UNFORGETTABLE. Avoid "AI-slop" (generic purple gradients).

[CHART_CAPABILITY]: Use \`\`\`chart-json blocks for stats/metrics.
JSON: { "type": "bar"|"line"|"pie", "title": "string", "data": { "labels": [], "datasets": [{ "label": "string", "data": [] }] } }`;

    const systemInstruction = `${baseIdentity}\n\n[INTERNAL_REASONING]:\n${formattedReasoning}`;

    const userMessage = sanitizedMessage || "Analyze image";

    // Step 1: First pass — decide tools. Use tight 3.5s timeout to stay under Vercel 10s limit.
    const toolController = new AbortController();
    const toolTimeout = setTimeout(() => toolController.abort(), 3500);
    
    let functionCalls: any[] = [];
    try {
      functionCalls = await fetchGemmaFunctionCalls(
        systemInstruction,
        userMessage,
        [webSearchTool, financeSearchTool, currencyExchangeTool, cryptoPricesTool, cryptoTrendingTool],
        toolController.signal,
        imageData,
        history as ConversationTurn[] | undefined
      );
    } catch (e) {
      console.warn("Tool detection timed out or failed, proceeding with baseline knowledge.");
    } finally {
      clearTimeout(toolTimeout);
    }

    // Step 2: Execute all function calls in parallel for maximum speed
    let liveContext = "";
    if (functionCalls.length > 0) {
      const results = await Promise.all(functionCalls.map(async (call: any) => {
        try {
          if (call.name === "web_search" && call.args?.query) {
            console.log(`[Parallel Execution] web_search("${call.args.query}")`);
            return await tavilySearch(call.args.query, req.signal);
          }
          if (call.name === "finance_search") {
            console.log(`[Parallel Execution] finance_search(${JSON.stringify(call.args)})`);
            return await fetchFinanceNews(call.args, req.signal);
          }
          if (call.name === "currency_exchange") {
            console.log(`[Parallel Execution] currency_exchange(${JSON.stringify(call.args)})`);
            return await fetchExchangeRates(call.args, req.signal);
          }
          if (call.name === "crypto_prices") {
            console.log(`[Parallel Execution] crypto_prices(${JSON.stringify(call.args)})`);
            return await fetchCryptoPrices(call.args, req.signal);
          }
          if (call.name === "trending_crypto") {
            console.log(`[Parallel Execution] trending_crypto()`);
            return await fetchTrendingCrypto(req.signal);
          }
        } catch (e) {
          console.warn(`Tool ${call.name} failed:`, e);
        }
        return "";
      }));
      liveContext = results.filter(Boolean).join("\n\n");
    }

    // Step 3: Final streaming answer with injected tool results
    // We use baseIdentity here to STRIP the reasoning instructions from the final output pass.
    const finalSystem = liveContext
      ? `${baseIdentity}\n\n[LIVE_WEB_DATA]: ${liveContext}`
      : baseIdentity;

    const stream = await fetchGemmaStream(
      finalSystem,
      userMessage,
      4096,
      undefined,
      undefined,
      req.signal,
      imageData,
      history as ConversationTurn[] | undefined
    );

    if (!stream) {
      return new Response("Failed to fetch stream", { status: 500 });
    }

    return new Response(stream.pipeThrough(createSSETransform()), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("API /answer error:", error);
    return new Response(error instanceof Error ? error.message : "Error", { status: 500 });
  }
}
