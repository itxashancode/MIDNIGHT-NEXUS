import { fetchGemmaFunctionCalls, fetchGemmaStream, ConversationTurn, GemmaImagePart } from "@/lib/gemma";
import { createSSETransform } from "@/lib/stream";
import { tavilySearch } from "@/lib/search";
import { fetchFinanceNews, fetchExchangeRates } from "@/lib/finance";
import { fetchCryptoPrices, fetchTrendingCrypto } from "@/lib/crypto";
import { firecrawlScrape } from "@/lib/firecrawl";

import { FRONTEND_DESIGN_SKILL } from "@/lib/skills";

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
      tickers: { type: "string", description: "Comma-separated stock tickers (e.g., 'AAPL,TSLA')." },
      keywords: { type: "string", description: "Search keywords (e.g., 'merger', 'earnings')." }
    }
  }
};

const currencyExchangeTool = {
  name: "currency_exchange",
  description: "Convert currency amounts or get the latest exchange rates for global currencies.",
  parameters: {
    type: "object",
    properties: {
      from:   { type: "string",  description: "Source currency code (e.g., 'USD')." },
      to:     { type: "string",  description: "Target currency code (e.g., 'EUR')." },
      amount: { type: "number",  description: "Amount to convert." },
      base:   { type: "string",  description: "Base currency for general rates lookup." }
    }
  }
};

const cryptoPricesTool = {
  name: "crypto_prices",
  description: "Get real-time cryptocurrency prices. Use CoinGecko IDs (e.g., 'bitcoin', 'ethereum', 'solana').",
  parameters: {
    type: "object",
    properties: {
      ids:          { type: "string", description: "Comma-separated crypto IDs." },
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

const webScrapeTool = {
  name: "web_scrape",
  description: "Scrape the full content of a specific URL and return clean markdown. Use this when the user shares a link or asks about the content of a specific page. Do NOT use for general questions — use web_search instead.",
  parameters: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The full URL to scrape (must start with https://)."
      }
    },
    required: ["url"]
  }
};

export async function POST(req: Request) {
  try {
    const {
      isApiDisabled,
      checkRateLimit,
      checkDailyBudget,
      isOriginAllowed,
      isBodyTooLarge,
      validateImage,
      sanitizeInput,
      sanitizeThought,
      capHistory,
    } = await import("@/lib/security");

    // ── 1. Global Kill Switch ──────────────────────────────────────────────
    if (isApiDisabled()) {
      return new Response("Service temporarily disabled.", { status: 503 });
    }

    // ── 2. Strict CORS ────────────────────────────────────────────────────
    const origin = req.headers.get("origin");
    if (!isOriginAllowed(origin)) {
      return new Response("Forbidden: Invalid Origin", { status: 403 });
    }

    // ── 3. Request Body Size Guard (50 KB) ────────────────────────────────
    if (isBodyTooLarge(req.headers.get("content-length"))) {
      return new Response("Payload Too Large", { status: 413 });
    }

    // ── 4. Per-IP Rate Limit ──────────────────────────────────────────────
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anonymous";
    if (!(await checkRateLimit(ip))) {
      return new Response("Too many requests — please wait a minute.", { status: 429 });
    }

    // ── 5. Global Daily Budget ────────────────────────────────────────────
    if (!(await checkDailyBudget())) {
      return new Response("Daily request limit reached. Try again tomorrow.", { status: 429 });
    }

    const { message, thoughts, image, history, protocol } = await req.json();


    // ── 6. Image Validation (Max 5MB) ─────────────────────────────────────
    if (image && !validateImage(image.base64, 5)) {
      return new Response("Invalid image. Max 5MB; supported: WebP, JPEG, PNG.", { status: 400 });
    }

    // ── 7. Input Sanitization ─────────────────────────────────────────────
    const sanitizedMessage = sanitizeInput(message, 10000);
    if (sanitizedMessage === "[BLOCKED_POTENTIAL_INJECTION]") {
      return new Response("Request blocked.", { status: 403 });
    }
    if (!sanitizedMessage && !image) {
      return new Response("Invalid request", { status: 400 });
    }
    if (!thoughts || !Array.isArray(thoughts)) {
      return new Response("Invalid request", { status: 400 });
    }

    // ── 8. History Cap (6 turns max — prevents token stuffing) ────────────
    const cappedHistory = capHistory(history as ConversationTurn[] | undefined);

    // ── 9. Thought Sanitization ───────────────────────────────────────────
    const cleanThoughts    = thoughts.slice(0, 12).map(t => sanitizeThought(t));
    const formattedReasoning = cleanThoughts
      .map(t => `###_REASONING_NODE_###\n${t}\n###_END_NODE_###`)
      .join("\n");

    const imageData: GemmaImagePart | undefined = image
      ? { inlineData: { mimeType: image.mimeType, data: image.base64 } }
      : undefined;

    const baseIdentity = `You are Dead Star, a high-performance intelligence engine powered by Gemma 4. You provide raw, unfiltered, and deeply reasoned analytical data.
    ${FRONTEND_DESIGN_SKILL}
Protocol: ${protocol === "local" ? "LOCAL_RESOURCES" : "CLOUD_COMPUTE"}.
${protocol === "local" ? "Instruction: Execute as LOCAL_INF. Simulate on-device processing. Be extremely concise and efficient." : "Instruction: Execute as CLOUD_INF. Utilize high-fidelity compute for maximum depth."}
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
    const userMessage       = sanitizedMessage || "Analyze image";

    // ── Step 1: Tool detection (increased to 12.0s for Gemma 4 stability) ──
    const toolController = new AbortController();
    const toolTimeout    = setTimeout(() => toolController.abort(), 12000);

    let functionCalls: any[] = [];
    try {
      functionCalls = await fetchGemmaFunctionCalls(
        systemInstruction,
        sanitizedMessage, // Only send the latest message for tool detection
        [webSearchTool, webScrapeTool, financeSearchTool, currencyExchangeTool, cryptoPricesTool, cryptoTrendingTool],
        toolController.signal,
        imageData,
        [] // Pass empty history for faster routing decision
      );
    } catch (e: any) {
      if (e.name === "AbortError") {
        console.warn("Tool detection TIMED OUT (5s limit reached). Using baseline knowledge.");
      } else {
        console.error("Tool detection FAILED with error:", e.message || e);
      }
    } finally {
      clearTimeout(toolTimeout);
    }

    // ── Step 2: Execute tool calls in parallel ────────────────────────────
    let liveContext = "";
    if (functionCalls.length > 0) {
      const results = await Promise.all(
        functionCalls.map(async (call: any) => {
          try {
            if (call.name === "web_search" && call.args?.query) {
              return await tavilySearch(call.args.query, req.signal);
            }
            if (call.name === "finance_search") {
              return await fetchFinanceNews(call.args, req.signal);
            }
            if (call.name === "currency_exchange") {
              return await fetchExchangeRates(call.args, req.signal);
            }
            if (call.name === "crypto_prices") {
              return await fetchCryptoPrices(call.args, req.signal);
            }
            if (call.name === "trending_crypto") {
              return await fetchTrendingCrypto(req.signal);
            }
          if (call.name === "web_scrape" && call.args?.url) {
            console.log(`[Parallel Execution] web_scrape("${call.args.url}")`);
            return await firecrawlScrape(call.args.url, req.signal);
          }
          } catch (e) {
            console.warn(`Tool ${call.name} failed:`, e);
          }
          return "";
        })
      );
      liveContext = results.filter(Boolean).join("\n\n");
    }

    // ── Step 3: Final streaming answer ────────────────────────────────────
    const finalSystem = liveContext
      ? `${baseIdentity}\n\n[LIVE_WEB_DATA]: ${liveContext}`
      : baseIdentity;

    const stream = await fetchGemmaStream(
      finalSystem,
      userMessage,
      8192,  // Extended fidelity output window for complex reasoning and deep design.
      undefined,
      undefined,
      req.signal,
      imageData,
      cappedHistory,
      protocol
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
