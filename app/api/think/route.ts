import { fetchGemmaStream, GemmaImagePart } from "@/lib/gemma";
import { createSSETransform } from "@/lib/stream";
import { FRONTEND_DESIGN_SKILL } from "@/lib/skills";

export const runtime = "edge";

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

    // ── 3. Request Body Size Guard ────────────────────────────────────────
    if (isBodyTooLarge(req.headers.get("content-length"))) {
      return new Response("Payload Too Large", { status: 413 });
    }

    // ── 4. Per-IP Rate Limit ──────────────────────────────────────────────
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anonymous";
    const { success, limit, remaining, reset } = await checkRateLimit(ip);
    
    const rateLimitHeaders = {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    };

    if (!success) {
      return new Response("Too many requests — please wait a minute.", { 
        status: 429,
        headers: rateLimitHeaders
      });
    }



    // ── 5. Global Daily Budget ────────────────────────────────────────────
    if (!(await checkDailyBudget())) {
      return new Response("Daily request limit reached. Try again tomorrow.", { status: 429 });
    }

    const { message, image, protocol } = await req.json();


    // ── 6. Image Validation (Max 5MB) ─────────────────────────────────────
    if (image && !validateImage(image.base64, 5)) {
      return new Response("Invalid image. Max 5MB; supported: WebP, JPEG, PNG.", { status: 400 });
    }

    const sanitizedMessage = sanitizeInput(message, 10000);
    if (sanitizedMessage === "[BLOCKED_POTENTIAL_INJECTION]") {
      return new Response("Request blocked.", { status: 403 });
    }

    const imageData: GemmaImagePart | undefined = image
      ? { inlineData: { mimeType: image.mimeType, data: image.base64 } }
      : undefined;

    const systemInstruction = `You are a high-speed reasoning engine for Dead Star AI.
${FRONTEND_DESIGN_SKILL}
Protocol: ${protocol === "local" ? "LOCAL_RESOURCES" : "CLOUD_COMPUTE"}.
${protocol === "local" ? "Instruction: Simulate on-device processing patterns. Be concise." : "Instruction: Utilize full model capacity for deep reasoning."}
Produce a sequence of short, professional, and analytical "thought nodes" in a JSON array format.`;


    const userMessage = `Analyze the complexity of this request: "${sanitizedMessage || "this image"}". 
    Generate a dynamic set of private pre-response thoughts (between 3 and 6) based on logic required.
    Simple queries should have 3 thoughts. Complex ones should have 6.
    Each thought must be one sentence under 15 words. 
    Output raw JSON array of strings only.`;

    const stream = await fetchGemmaStream(
      systemInstruction,
      userMessage,
      400, // thinking phase is cheap — keep it small
      undefined,
      undefined,
      req.signal,
      imageData,
      undefined, // No history for thinking phase
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
    console.error("API /think error:", error);
    return new Response(error instanceof Error ? error.message : "Error", { status: 500 });
  }
}
