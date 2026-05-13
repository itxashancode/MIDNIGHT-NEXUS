import { fetchGemmaFunctionCall, fetchGemmaStream, ConversationTurn, GemmaImagePart } from "@/lib/gemma";
import { createSSETransform } from "@/lib/stream";
import { tavilySearch } from "@/lib/search";

export const runtime = "edge";

// Native Gemma 4 Function Declaration for web search
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

export async function POST(req: Request) {
  try {
    const { message, thoughts, image, history } = await req.json();
    const ip = req.headers.get("x-forwarded-for") || "anonymous";

    // 1. Rate Limiting (10 requests per minute)
    const { rateLimit, validateImage, sanitizeThought } = await import("@/lib/security");
    if (!rateLimit(ip, 10)) {
      return new Response("Too many requests. Please wait a minute.", { status: 429 });
    }

    // 2. Image Validation (Max 5MB)
    if (image && !validateImage(image.base64)) {
      return new Response("Image too large. Maximum size is 5MB.", { status: 400 });
    }

    if (!message && !image) {
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

    const systemInstruction = `You are a sharp, opinionated developer on Slack. 
Vibe: Direct, casual, no-nonsense.
Context: Below is YOUR OWN internal reasoning and research nodes. 

[INTERNAL_REASONING_START]
${formattedReasoning}
[INTERNAL_REASONING_END]

STRICT RULES:
1. Speak ONLY to the user based on the reasoning above.
2. NEVER mention reasoning, research, or internal tags.
3. DO NOT repeat greetings or act like a bot.
4. If the message is simple (like "hey"), just reply naturally.
5. Use the web_search tool ONLY if you genuinely need live/current data.

ADAPTIVE EFFICIENCY:
- Think efficiently and at a lower depth for this final response, as the heavy reasoning nodes are provided above.`;

    const userMessage = message || "Analyze image";

    // Step 1: First Gemma 4 call — let it decide if it needs to search
    const functionCallResult = await fetchGemmaFunctionCall(
      systemInstruction,
      userMessage,
      [webSearchTool],
      req.signal,
      imageData,
      history as ConversationTurn[] | undefined
    );

    // Step 2: If Gemma called web_search, execute it and do a second pass
    let liveContext = "";
    if (functionCallResult?.name === "web_search" && functionCallResult?.args?.query) {
      try {
        console.log(`[Gemma 4 Function Call] web_search("${functionCallResult.args.query}")`);
        liveContext = await tavilySearch(functionCallResult.args.query, req.signal);
      } catch (e) {
        console.warn("Tavily execution failed:", e);
      }
    }

    // Step 3: Final streaming answer with injected tool results
    const finalSystem = liveContext
      ? `${systemInstruction}\n\n[LIVE_WEB_DATA]: ${liveContext}`
      : systemInstruction;

    const stream = await fetchGemmaStream(
      finalSystem,
      userMessage,
      1024,
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
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: unknown) {
    console.error("API /answer error:", error);
    return new Response(error instanceof Error ? error.message : "Error", { status: 500 });
  }
}
